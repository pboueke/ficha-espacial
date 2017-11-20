#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var firjan = require("./models/firjan-index")
var string = require("./utils/string-utils.js");
var lineByLine = require('n-readlines');

program
    .usage('[options]')
    .option("-m, --measure <ms>", "the type of measure")
    .option("-s, --save <sv>", "the collection where to save the registers")
    .parse(process.argv);

process.on('unhandledRejection', (err, p) => { 
    console.error(err)
})

// connect to the database
const host = process.env.ARANGODB_HOST;
const port = process.env.ARANGODB_PORT;
const database = process.env.ARANGODB_DB;
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
const db = new arangojs.Database({
    url: `http://${username}:${password}@${host}:${port}`,
    databaseName: database,
    retryConnection:true
});

var debug = {
    measure: "m2",
    save: "measure-m2",
}

var ms = program.measure || debug.measure;
var sv = program.save || debug.save;

// adds relationships between yearly the objects from the same city 
if (ms === "m1")  { 
    console.log(`[${ms}] Starting saving measuremnts at ${sv}`);
    (async () => {
        var counter = 0;
        var ct_counter = 0;
        var rd_counter = 0
        var col1 = db.collection("measure-m1");
        var col2 = db.collection("elected-candidate-edges");
        var col3 = db.collection(sv);
        var col4 = db.collection("firjan-geral-edges");

        const cur = await col1.all();
        let size = cur.count;
        
        var buffer = []
        var buffer_couter = 0;
        cur.each(async function (val) {
            buffer.push(await val);
            console.log(buffer_couter++)
        }).then(()=> {
            buffer.forEach(async (item) => {
                await processItem(item);
                rd_counter += 1;
            })
        })

        //processItem(cur.next());

        async function processItem(item) {
            if (await item === null || !item) {
                console.log("All Done, total inserted: " + counter); 
                process.exit();
            }

            const sq1 = arangojs.aql`
            FOR edge IN ${col2}
            FILTER edge._from == ${item._id}
            RETURN edge
            `;

            let edge_counter = 0;
            let delta_sum = 0;
            let year_sum = {};
            let year_count = {}

            let cur1  = await db.query(sq1);
            cur1.each(async(val)=>{
                await calculateM1(await val)
            }).then(async ()=>{

                let ya = [];
                Object.keys(year_sum).forEach(function(key) {
                    ya.push({
                        year: key,
                        value: (year_sum[key]/year_count[key])
                    })
                });

                let measure = {
                    _key: item._key + "_m1",
                    value: (delta_sum/edge_counter),
                    years: ya,
                    candidate: item._id
                }

                try{
                    await col3.save(measure);
                    console.log(`[${counter}  ${ct_counter} / ${rd_counter} / ${size}] Saved measure: ${measure._key}`);
                    counter += 1;                    
                    
                } catch (er2) {
                    console.log(`[${counter}  ${ct_counter} / ${rd_counter} / ${size}] Measure already in base: ${measure._key}`);                    
                };
            })

            async function calculateM1 (val) {
                console.log(`[${counter} / ${ct_counter} / ${rd_counter} / ${size}] Parsing edge: ${val._key}`);
                
                let abort = false;
                try {
                    let arr = val._to.split("_");
                    var id = val._to.replace("/", "-edges/") + "_" + (parseInt(arr[arr.length-1]) + 1).toString();
                    var city = await col4.document(id);
                    ct_counter += 1;
                } catch (ex) { 
                    abort = true; 
                    ct_counter += 1;
                    console.log(`[${counter} / ${ct_counter} / ${rd_counter} / ${size}] Skipping edge: ${id}`);
                }
                
                if (!abort) {
                    console.log(`[${counter} / ${ct_counter} / ${rd_counter} / ${size}] Processing edge: ${id}`);                    
                    edge_counter += 1;
                    delta_sum += parseFloat(await city.delta) || 0;
                    let aux = val._key.split("_");
                    year_sum[aux[aux.length-1]] = (year_sum[aux[aux.length-1]] || 0) + (parseFloat(city.delta)||0);
                    year_count[aux[aux.length-1]] = (year_count[aux[aux.length-1]] || 0) + 1;
                }
                return;
            }
        }
    })();
} else if (ms === "m2")  { 
    console.log(`[${ms}] Starting saving measuremnts at ${sv}`);
    (async () => {
        var counter = 0;
        var ct_counter = 0;
        var rd_counter = 0
        var col1 = db.collection("measure-m1");
        var col2 = db.collection(sv);

        const cur = await col1.all();
        let size = cur.count;

        var yearly_delta_sum = {};
        var yearly_counter = {};
        var yearly_delta = {};
        
        var buffer = []
        var buffer_couter = 0;
        cur.each(async function (val) {
            buffer.push(await val);
            console.log("Reading values from db " + buffer_couter++)
        }).then(()=> {
            buffer.forEach(async (item) => {
                getSums(await item);
                rd_counter += 1;
            });
        }).then(() => {
            console.log("Calculating means...")
            getMeans();
            console.log("Means calculated.")
        }).then(() => {
            buffer.forEach(async (item) => { 
                let aux_val = 0;
                let aux_years = {}
                let c = 0;
                item.years.forEach(function(obj) {
                    let v = obj.value - yearly_delta[obj.year];
                    aux_years[obj.year] = v;  
                    aux_val += v;
                    c += 1;
                });
                let new_item = item;
                delete new_item._id;
                new_item._key = new_item._key.substring(0, new_item._key.length -3) + "m2";
                new_item.years = aux_years;
                new_item.value = aux_val / c;
                counter += 1;
                try{
                    await col2.save(new_item);
                    console.log(`${counter}] New measure saved: ${new_item._key}` );
                } catch (err) {console.log(`${counter}] Measure already in base: ${new_item._key}`);}
            });
        });

        function getSums(item) {
            if (item.years && item.years.length > 0) {
                for (let y in item.years) {
                    if (item.years[y].year && item.years[y].value) {
                        yearly_delta_sum[item.years[y].year] = (yearly_delta_sum[item.years[y].year]||0) + item.years[y].value;
                        yearly_counter[item.years[y].year] = (yearly_counter[item.years[y].year]||0) + 1;
                    }
                }
            }
        }

        function getMeans() {
            Object.keys(yearly_delta_sum).forEach(function(key) {
                yearly_delta[key] = (yearly_delta_sum[key]/yearly_counter[key])
            });
        }

    })();
    } else {
    throw (ms + " is not a supported measure");
}
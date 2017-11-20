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
    measure: "m1",
    save: "measure-m1",
}

var ms = program.measure || debug.measure;
var sv = program.save || debug.save;

// adds relationships between yearly the objects from the same city 
if (ms === "m1")  { 
    console.log(`[${ms}] Starting saving measuremnts at ${sv}`);
    (async () => {
        let counter = 0;
        var col1 = db.collection("elected-candidate-person");
        var col2 = db.collection("elected-candidate-edges");
        var col3 = db.collection(sv);
        var col4 = db.collection("firjan-geral-edges");
        const q = arangojs.aql`
            FOR cand IN ${col1}
            RETURN cand
            `;
        console.log(q);
        const cur = await db.query(q);

        cur.each(async function (val) {
            processItem(await val);
        });

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

            let cur1  = await db.query(sq1);

            calculateM1(await cur1.next());

            let edge_counter = 0;
            let delta_sum = 0;
            let year_sum = {};
            let year_count = {}

            async function calculateM1 (val) {
                if (await val === null || !val) {                    
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
        
                    console.log(`[${counter}] Saving measure: ${measure._key}`);
                    try{
                        await col3.save(measure);
                    } catch (er2) {};
        
                    counter += 1;
                    return;
                }
                console.log(`[${counter}] Parsing edge: ${val._key}`);
                let abort = false;
                try {
                    let arr = val._to.split("_");
                    var id = val._to.replace("/", "-edges/") + "_" + (parseInt(arr[arr.length-1]) + 1).toString();
                    var city = await col4.document(id);
                } catch (ex) { 
                    abort = true; 
                    console.log(`[${counter}] Skipping edge from: ${val._from}`);
                }
                
                if (!abort) {
                    edge_counter += 1;
                    delta_sum += parseFloat(await city.delta) || 0;
                    let aux = val._key.split("_");
                    year_sum[aux[aux.length-1]] = (year_sum[aux[aux.length-1]] || 0) + (parseFloat(city.delta)||0);
                    year_count[aux[aux.length-1]] = (year_count[aux[aux.length-1]] || 0) + 1;
                }

                // we can use this iterate method here because the cursor size is always less than 1k
                // this allows us to do everything synchronously
                Promise.resolve().then(async () => calculateM1(await cur1.next()));
            }
        }
    })();
} else {
    throw (tp + " is not a supported type");
}
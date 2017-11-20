#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var firjan = require("./models/firjan-index")
var string = require("./utils/string-utils.js");
var lineByLine = require('n-readlines');

program
    .usage('[options]')
    .option("-t, --type <tp>", "the type of edge to be created")
    .option("-s, --source <src>", "the source/collection")
    .option("-y, --year <yr>", "the year to start the relations", parseInt)
    .option("-d, --destiny <src>", "the destiny source/collection, if needed")
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
    type: "years",
    source: "firjan-geral",
    year: "2006",
    destiny: "firjan-geral"
}

var yr = program.year || debug.year;
var tp = program.type || debug.type;
var src = program.src || debug.source;
var dst = program.destiny || debug.destiny;

// adds relationships between yearly the objects from the same city 
if (tp === "years")  { 
    console.log(`[${tp}] Starting from ${yr} for source ${src}`);
    (async () => {
        let counter = 0;
        let edge_counter = 0;
        var col = db.collection(src);
        const q = arangojs.aql`
            FOR city IN ${col}
            FILTER city.year == ${yr.toString()}
            RETURN city
            `;
        console.log(q);
        const cur = await db.query(q);

        cur.each(async function (val) {
            processItem(await val);
        });

        //processItem(cur.next());

        async function addYearEdge (city) {
            let sq = arangojs.aql`
                FOR city IN ${col}
                FILTER city.location == ${city.location} 
                AND city.year == ${(parseInt(city.year) + 1).toString()}
                RETURN city
            `; 

            let abort = false;
            try {
                var future_city = await db.collection(src).document(city.location+"_"+(parseInt(city.year)+1).toString());
            } catch (err) {
                console.log (err.message);
                abort = true;
            }

            if (abort || !future_city || future_city === null) {
                counter += 1;
                console.log(`[${counter} / ${edge_counter}] Done with city: ${city.location}`);
                return;
            }

            let edge = {
                _key: city.location + "_" + city.year + "_" + future_city.year,
                _from: city._id,
                _to: future_city._id,
                location: city.location,
                delta: (parseFloat((future_city.score||"0").replace(",","."))-parseFloat((city.score||"0").replace(",",".")))
            }

            try {
                await db.collection(src+"-edges").save(edge);
                edge_counter += 1;
                console.log(`[${counter} / ${edge_counter}] Saved new edge: ${edge._key}`)
            } catch (err) {
                console.log(err.message)
                console.log(`[${counter} / ${edge_counter}] City already connected: ${edge._key}`)
            }

            Promise.resolve().then(() => addYearEdge(future_city));
        }

        async function processItem(item) {
            if (await item === null || !item) {
                console.log("All Done, total inserted: " + counter); 
                process.exit();
            }
            await addYearEdge(await item);
            counter += 1;

            //Promise.resolve().then(() => processItem( cur.next()));
        }
    })();
} else if (tp === "elections")  { 
    console.log(`[${tp}] Starting from ${yr} for source ${src}`);
    (async () => {
        let counter = 0;
        let edge_counter = 0;
        var col = db.collection(src);
        const q = arangojs.aql`
            FOR cand IN ${col}
            FILTER cand.year == ${yr.toString()}
            RETURN cand
            `;
        console.log(q);
        const cur = await db.query(q);

        cur.each(async function (val) {
            processItem(await val);
        });

        processItem(cur.next());

        async function processItem(item) {
            if (await item === null || !item) {
                console.log("All Done, total inserted: " + counter); 
                process.exit();
            }

            let edge1 = {
                _key: item.canidate_name + "_" + (parseInt(item.year)+0).toString(),
                _from: item._id,
                _to: dst + "/" + item.location + "_" + (parseInt(item.year)+0).toString(),
            }
            try {
                await db.collection(src+"-edges").save(edge1);
                edge_counter += 1;
                console.log(`[${counter} / ${edge_counter}] Saved new edge: ${edge1._key}`)
            } catch (err) {
                console.log(err.message)
                console.log(`[${counter} / ${edge_counter}] Candidate and city already connected: ${edge1._key}`)
            }
            let edge2 = {
                _key: item.canidate_name + "_" + (parseInt(item.year)+1).toString(),
                _from: item._id,
                _to: dst + "/" + item.location + "_" + (parseInt(item.year)+1).toString(),
            }
            try {
                await db.collection(src+"-edges").save(edge2);
                edge_counter += 1;
                console.log(`[${counter} / ${edge_counter}] Saved new edge: ${edge2._key}`)
            } catch (err) {
                console.log(err.message)
                console.log(`[${counter} / ${edge_counter}] Candidate and city already connected: ${edge2._key}`)
            }
            let edge3 = {
                _key: item.canidate_name + "_" + (parseInt(item.year)+2).toString(),
                _from: item._id,
                _to: dst + "/" + item.location + "_" + (parseInt(item.year)+2).toString(),
            }
            try {
                await db.collection(src+"-edges").save(edge3);
                edge_counter += 1;
                console.log(`[${counter} / ${edge_counter}] Saved new edge: ${edge3._key}`)
            } catch (err) {
                console.log(err.message)
                console.log(`[${counter} / ${edge_counter}] Candidate and city already connected: ${edge3._key}`)
            }
            let edge4 = {
                _key: item.canidate_name + "_" + (parseInt(item.year)+3).toString(),
                _from: item._id,
                _to:  dst + "/" + item.location + "_" + (parseInt(item.year)+3).toString(),
            }
            try {
                await db.collection(src+"-edges").save(edge4);
                edge_counter += 1;
                console.log(`[${counter} / ${edge_counter}] Saved new edge: ${edge4._key}`)
            } catch (err) {
                console.log(err.message)
                console.log(`[${counter} / ${edge_counter}] Candidate and city already connected: ${edge4._key}`)
            }
            

            counter += 1;

            //Promise.resolve().then(() => processItem( cur.next()));
        }
    })();
} else {
    throw (tp + " is not a supported type");
}
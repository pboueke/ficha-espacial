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
    .option("-s, --source <src>", "the source/collection, if needed")
    .option("-y, --year <yr>", "the year to start the relations", parseInt)
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
    reretryConnection:true
});

var debug = {
    type: "years",
    source: "firjan-geral",
    year: "2006"
}

var yr = program.year || debug.year;
var tp = program.type || debug.type;
var src = program.src || debug.source;

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
            LIMIT 6000
            RETURN city
            `;
        console.log(q);
        const cur = await db.query(q);

        cur.each(async function (val) {
            processItem(await val);
        });

        processItem(cur.next());

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

            /*while (!cur.hasNext()) {
                setTimeout(function() {
                    console.log('Waiting cursor');
                }, 3000);
            }

            Promise.resolve().then(() => processItem( cur.next()));*/
        }
    })();
} else {
    throw (tp + " is not a supported type");
}
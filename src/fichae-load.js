#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var candidate = require("./models/candidate.js");
var string = require("./utils/string-utils.js");

program
    .option('-f, --force', 'force installation')
    .parse(process.argv);

var args = program.args;

if (args.length < 1 || args.length > 3) { 
    throw util.error("Incorrect number of arguments. Make sure you are passing the data source, its year and its path");
    // $ fichae load tre-consulta-cand 2016 path/to/file
}

// connect to the database
const host = process.env.ARANGODB_HOST;
const port = process.env.ARANGODB_PORT;
const database = process.env.ARANGODB_DB;
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
const db = new arangojs.Database({
    url: `http://${username}:${password}@${host}:${port}`,
    databaseName: database
});

console.log("Loading source " + args[0] + " " + args[1] + " from "+ args[2])

if (args[0] === "tre-consulta-cand") {
    const col = db.collection(args[0])
    var counter = 0;

    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(args[2])
      });

    lineReader.on('line', function (line) {
        var l = string.replaceAll(line,'"', '').split(";");
        var obj = candidate.serializeCandidateFromArray(l, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving candidate: " + obj._key);
        col.save(obj);
        counter += 1;
      });

    console.log("Total number of registers saved: " + counter);
};
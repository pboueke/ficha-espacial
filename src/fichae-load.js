#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var candidate = require("./models/candidate.js");
var property = require("./models/candidate-property.js");
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
const dataCol = db.collection(args[0])
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(args[2])
  });


if (args[0] === "tre-consulta-cand") {

    lineReader.on('line', function (line) {
        var l = string.replaceAll(line,'"', '').split(";");
        var obj = candidate.serializeCandidateFromArray(l, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving candidate: " + obj.candidate_name);
        dataCol.save(obj);
      });

} else if (args[0] === "tre-bem-candidato") {
    
    lineReader.on('line', function (line) {
        var l = string.replaceAll(line,'"', '').split(";");
        var obj = property.serializeCandidatePropertyFromArray(l, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving property: " + obj.property_detail);
        dataCol.save(obj);
      });
};
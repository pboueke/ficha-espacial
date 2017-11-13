#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var candidate = require("./models/candidate.js");
var property = require("./models/candidate-property.js");
var result = require("./models/candidate-voting-results.js");
var voter = require("./models/voter-profile.js")
var string = require("./utils/string-utils.js");
var readline = require('linebyline');

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
var file = readline(args[2], {retainBuffer: false});


if (args[0] === "tre-consulta-cand") {

    file.on('line', function (line) {
        let obj = candidate.deserializeCandidateFromLine(line, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving candidate: " + obj.candidate_name);
        dataCol.save(obj);
      });

} else if (args[0] === "tre-bem-candidato") {
    
    file.on('line', function (line) {
        let obj = property.deserializeCandidatePropertyFromLine(line, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving property: " + obj.property_detail);
        dataCol.save(obj);
      });

} else if (args[0] === "tre-votacao-candidato") {
    
    file.on('line', function (line) {
        let obj = result.deserializeCandidateVotingResultsFromLine(line, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving result: " + obj.zone_code);
        dataCol.save(obj);
      });
      
} else if (args[0] === "tre-perfil-eleitor") {
    
    file.on('line', function (line) {
        let obj = voter.deserializeVoterProfileFromLine(line, args[1]);
        
        console.log("["+obj.year+"]["+args[0]+"] Saving voter profile: " + obj.zone_number);
        dataCol.save(obj);
      });
};
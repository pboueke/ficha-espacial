#!/usr/bin/env node

var util = require("util");
var program = require('commander');
var arangojs = require('arangojs');
var candidate = require("./models/candidate.js");
var property = require("./models/candidate-property.js");
var result = require("./models/candidate-voting-results.js");
var voter = require("./models/voter-profile.js")
var firjan = require("./models/firjan-index")
var string = require("./utils/string-utils.js");
var lineByLine = require('n-readlines');

program
    .option('-f, --force', 'force installation')
    .parse(process.argv);

var args = program.args;

process.on('unhandledRejection', (err, p) => { 
    console.error(p)
})

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
var liner = new lineByLine(args[2]);

var counter = 0;
var deserializer = function() { throw "Unknown source"; };
switch(args[0]) {
    case "tre-consulta-cand":
        deserializer = candidate.deserializeCandidateFromLine;
        break;
    case "tre-bem-candidato":
        deserializer = property.deserializeCandidatePropertyFromLine;
        break;
    case "tre-votacao-candidato":
        deserializer = cresult.deserializeCandidateVotingResultsFromLine;
        break;
    case "tre-perfil-eleitor":
        deserializer = voter.deserializeVoterProfileFromLine;
        break;
    case "firjan-geral":
        deserializer = firjan.deserializeFirjanIndexFromLine;
        break;
}

processLine(liner.next());

async function processLine (line) {
    if (line === null || !line) { 
        console.log("All Done"); 
        return ;
    };

    let obj = deserializer(line.toString('utf-8'), args[1]);
    counter += 1;
    console.log("["+obj.year+"] ["+args[0]+"] " + counter + " Saving object");
    await dataCol.save(obj);

    Promise.resolve().then(() => processLine(liner.next()));
};

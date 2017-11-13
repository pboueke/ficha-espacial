#!/usr/bin/env node

// for files of type votacao_candidato_munzona_year_uf.txt

var util = require("util");
var string = require("../utils/string-utils.js");

module.exports = {

    deserializeCandidateVotingResultsFromLine: function(line, year) {
        var obj = {};
        if (year === "2014" || year === "2016") { 
            var it = 2;
            var l = string.replaceAll(line,'"', '').split(";");            
            obj.year = year;
            obj.election_year = l[it++];
            obj.election_turn = l[it++];
            obj.election_desc = l[it++];
            obj.uf = l[it++];
            obj.ue = l[it++];
            obj.city_code = l[it++];
            obj.city_name = l[it++];
            obj.zone_code = l[it++];
            obj.job_code = l[it++];
            obj.candidate_urn_code = l[it++];
            obj.candidate_ui = l[it++];
            obj.candidate_name = l[it++];
            obj.candidate_urn_name = l[it++];
            obj.job_description = l[it++];
            obj.candidate_sit_superior_code = l[it++];
            obj.candidate_sit_superior_desc = l[it++];
            obj.candidate_sit_cod = l[it++];
            obj.candidate_sit_desc = l[it++];
            obj.candidate_sit_tot_cod = l[it++];
            obj.candidate_sit_tot_desc = l[it++];
            obj.party_number = l[it++];
            obj.party_initials = l[it++];
            obj.party_name = l[it++];
            obj.legend_ui = l[it++];
            obj.coalision_name = l[it++];
            obj.legend_composition = l[it++];
            obj.total_votes = l[it++];
            obj.transito = l[it++];
            obj.candidate_link = "tre-consulta-cand/" + obj.candidate_ui;
            
            return obj;
        }
        throw utils.error("Unsuported election year for candidate serialization");
    }
}
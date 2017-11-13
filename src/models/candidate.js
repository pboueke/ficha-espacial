#!/usr/bin/env node
var util = require("util");

module.exports = {

    serializeCandidateFromArray: function(args, year) {
        var obj = {};
        if (year === "2014" || year === "2016") { 
            var it = 2;
            var l = args;
            obj.year = year;
            obj.election_year = l[it++];//2:ANO_ELEICAO
            obj.election_turn = l[it++];
            obj.election_desc = l[it++];
            obj.uf = l[it++];
            obj.ue = l[it++];
            obj.ue_desc = l[it++];
            obj.job_cod = l[it++];
            obj.job_desc = l[it++];
            obj.candidate_name = l[it++];
            obj.ui = l[it++]; // unique id
            obj.candidate_num = l[it++];
            obj.candidate_CPF = l[it++];
            obj.candidate_urn_name = l[it++];
            obj.candidate_status_code = l[it++];
            obj.candidate_status_desc = l[it++];
            obj.party_number = l[it++];
            obj.party_initials = l[it++];
            obj.party_name = l[it++];
            obj.legend_cod = l[it++];
            obj.legend_initials = l[it++];
            obj.legend_composition = l[it++];
            obj.legend_name = l[it++];
            obj.occupation_code = l[it++];
            obj.occupation_desc = l[it++];
            obj.birthdate = l[it++];
            obj.titulo_eleitoral_number = l[it++];
            obj.age = l[it++];
            obj.sex_code = l[it++];
            it++; //skip DESCRICAO_SEXO
            obj.instruction_degree_cod = l[it++];
            obj.instruction_degree_desc = l[it++];
            obj.civil_state_cod = l[it++];
            obj.civil_state_desc = l[it++];
            obj.race_code = l[it++];
            obj.race_description = l[it++];
            obj.nationality_code = l[it++];
            obj.nationality_desc = l[it++];
            obj.uf_birth = l[it++];
            obj.city_birth_cod = l[it++];
            obj.city_birth_name = l[it++];
            obj.max_campaign_expense = l[it++];
            obj.sit_tot_turn_code = l[it++];
            obj.sit_tot_turn_desc = l[it++];
            obj.nm_email = l[it++];
            
            return obj;
        }
        throw utils.error("Unsuported election year for candidate serialization");
    }
}
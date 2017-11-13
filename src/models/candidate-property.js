#!/usr/bin/env node
var util = require("util");

module.exports = {

    serializeCandidatePropertyFromArray: function(args, year) {
        var obj = {};
            var it = 2;
            var l = args;
            
            obj.election_year = l[it++];
            obj.election_desc = l[it++];
            obj.uf = l[it++];
            obj.candidate_ui = l[it++];
            obj.property_type_cod = l[it++];
            obj.property_type_desc = l[it++];
            obj.property_detail = l[it++];
            obj.property_value = l[it++];
            obj.last_update_date = l[it++];
            obj.last_update_hour = l[it++];
            obj.candidate_link = "tre-consulta-cand/" + obj.candidate_ui;

            
            return obj;

    }
}
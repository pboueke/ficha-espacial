#!/usr/bin/env node
var util = require("util");
var string = require("../utils/string-utils.js");

module.exports = {

    deserializeCandidatePropertyFromLine: function(line, year) {
        var obj = {};
            var it = 2;
            var l = string.replaceAll(line,'"', '').split(";");            
            
            obj.year = year;
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
            
            return obj;

    }
}
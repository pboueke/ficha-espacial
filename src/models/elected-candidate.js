#!/usr/bin/env node
var util = require("util");
var string = require("../utils/string-utils.js");

module.exports = {

    deserializeElectedCandidateFromLine: function(line, year) {
        var obj = {};
            var it = 1;
            var l = string.replaceAll(line,'"', '').split(",");            
            
            obj.year = year;
            obj.candidate_name = l[it++];
            it++; //skip city code
            obj.city_name = l[it++];
            obj.uf = l[it++];
            obj.job = l[it++];
            obj.status = l[it++];
            obj.votes = l[it++];
            obj.location = string.normalizeCity(obj.uf, obj.city_name);
            obj._key = string.normalizePolName(obj.candidate_name)+"_"+obj.location+"_"+year;
            
            return obj;

    }
}
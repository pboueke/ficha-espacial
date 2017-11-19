#!/usr/bin/env node

var util = require("util");
var string = require("../utils/string-utils.js");

module.exports = {

    deserializeFirjanIndexFromLine: function(line, year) {
        var obj = {};
            var l = string.replaceAll(line,'"', '').split("\t");            
            
            obj.year = year;
            obj.cod = l[0];
            obj.region = l[1];
            obj.uf = l[2];
            obj.city_name = l[3];     
            obj.score = l[4]       
            obj.rank = l[5];
            obj.location = string.normalizeCity(obj.uf, obj.city_name);
            
            return obj;

    }
}
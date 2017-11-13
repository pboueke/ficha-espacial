#!/usr/bin/env node

// for files of type perfil_eleitor_secao_year_uf.txt

var util = require("util");
var string = require("../utils/string-utils.js");

module.exports = {

    deserializeVoterProfileFromLine: function(line, year) {
        var obj = {};
            var it = 2;
            var l = string.replaceAll(line,'"', '').split(";");            
            
            // tre documentation does not match this type of file... 

            obj.year = year;
            obj.period = l[2];
            obj.uf = l[3];
            obj.city_tse_cod = l[4];
            obj.city = l[5];     
            obj.section = l[6]       
            obj.zone_number = l[7];
            obj.civil_state = l[9];
            obj.sex = l[15];
            obj.age_range = l[11];
            obj.instruction_level = l[13];
            obj.number_of_people = l[16]; // lets hope
            
            return obj;

    }
}
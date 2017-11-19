#!/usr/bin/env node
require('dotenv').config();

const program = require('commander');
program
  .version('0.0.1')
  .command('load <source> <file>','loads a data file into the database')
  .command('create-edges','creates the edge objects of specific pre defined types')
  .parse(process.argv); // end with parse to parse through the input
#!/usr/bin/env node

var program = require('commander'),
    resolve = require('path').resolve;

// Commander
program
  .version('0.0.1')
  .option('-d, --dir <path>', 'the location of your template files [./]', './')
  .option('-p, --partials-dir <path>', 'the location of your partial files [./partials]', './partials')
  .option('-c, --contexts-dir <path>', 'the location of your context files [./contexts]', './contexts')
  .option('-o, --output-dir <path>', 'where to output files [./dist]', './dist')
  .option('-e, --extension <ext>', 'template file extension [.html]', '.html')
  .option('-E, --partial-extension <ext>', 'partial file extension [.handlebars]', '.handlebars')
  .option('-C, --no-partial-compile-all', 'disable compile all on partial change')
  .parse(process.argv);

// var Tessellate = require("../lib/tessellate");
// var args = process.argv.slice(2);
// new Tessellate(args);
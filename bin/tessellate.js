#!/usr/bin/env node

// TODO: Tidy HTML?
// TODO: Register partials on a new .mustache event
// TODO: Indicate the name of a missing partial

'use strict';

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    watchr = require('watchr'),
    hogan = require('hogan.js');

// Commander
program
  .version('0.1.0')
  .option('-d, --dir <path>', 'the location of your template files [./]', String, './')
  .option('-p, --partials-dir <path>', 'the location of your partial files [./partials]', String, './partials')
  .option('-c, --contexts-dir <path>', 'the location of your context files [./contexts]', './contexts')
  .option('-o, --output-dir <path>', 'where to output files [./dist]', './dist')
  .option('-e, --extension <ext>', 'template file extension [.html]', '.html')
  .option('-E, --partial-extension <ext>', 'partial file extension [.mustache]', '.mustache')
  .option('-C, --no-partial-compile-all', 'disable compile all on partial change')
  .parse(process.argv);

// Settings
var settings = {
  baseDir:            program.dir,
  partialsDir:        program.partialsDir,
  contextsDir:        program.contextsDir,
  outputDir:          program.outputDir,
  baseExtension:      program.extension,
  partialExtension:   program.partialExtension,
  partialCompileAll:  program.partialCompileAll
};

// Make sure our output dir exists
if (!fs.existsSync(settings.outputDir)) {
  fs.mkdirSync(settings.outputDir);
}

// Make sure all of our partials are registered
var partials = registerPartials();

// Watch the baseDir for changes
watchr.watch({
    path: settings.baseDir,
    ignoreHiddenFiles: true,
    ignorePatterns: true,
    listener: function(eventName, filePath, fileCurrentStat, filePreviousStat) {
      var extension = path.extname(filePath);

      // Ignore file deletions
      if (eventName === 'unlink') return;
      // Ignore writing to the output dir
      if (path.dirname(filePath) === path.normalize(settings.outputDir)) return;
      // When a template file is changed compile and output
      if (extension === settings.baseExtension) {
        compile(filePath);
        return;
      }
      // When a partial file is changed check if we should compile all
      // of our templates.
      if (extension === settings.partialExtension) {
        if (settings.partialCompileAll) {
          fs.readdirSync(settings.baseDir).forEach(function(file) {
            if (path.extname(file) === settings.baseExtension) {
              compile(file);
            }
          });
        }
      }
    },
    next: function(err, watcher) {
      if (err)  throw err;
      console.log('watching ' + path.resolve(settings.baseDir) + ' for changes...');
    }
});

// On program start and any time a partial is added register
// everything in the partials dir
function registerPartials() {
  var partials = {};

  if (fs.existsSync(settings.partialsDir)) {
    fs.readdirSync(settings.partialsDir).forEach(function(file) {
      var name = path.basename(file, path.extname(file)); // strips file extension from file name
      partials[name] = fs.readFileSync(path.join(settings.partialsDir, file), 'utf8') + '\n';
    });
  }

  return partials;
}

// Run our file through hogan and write the output
// to a new file
function compile(filePath) {
  fs.readFile(filePath, 'utf8', function(err, data) {
    var source, template, contextPath, context, html;

    if (err) return console.log(err);

    source = data;
    template = hogan.compile(source);

    // Check to see if a context file exists, if so
    // add it to the template. Otherwise send in a
    // blank object
    contextPath = './' + path.join(settings.contextsDir, path.basename(filePath, settings.baseExtension));
    if (fs.existsSync(contextPath + '.js')) {
      context = require(path.resolve(contextPath));
      html = template.render(context, partials);
    } else {
      html = template.render({});
    }

    fs.writeFile(path.join(settings.outputDir, path.basename(filePath)), html, function (err) {
      if (err) return console.log(err);
      console.log(filePath + ' > ' + path.join(settings.outputDir, path.basename(filePath)));
    });
  });
}
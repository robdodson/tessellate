'use strict';

// TODO: If the dist folder doesn't exist, create it
// TODO: Command line and CLI config options
// TODO: Register partials on a new .handlebars event

var fs = require('fs'),
    path = require('path'),
    watchr = require('watchr'),
    Handlebars = require('handlebars');

var settings = {
  baseExtension: '.html',
  partialExtension: '.handlebars',
  baseDir: './',
  partialDir: './partials',
  contextDir: './contexts',
  outputDir: './dist',
  // Changing a partial file will compile all
  // of the files in the basedir. This is the
  // lazy way to make sure partial changes
  // show up immediately.
  partialCompileAll: true
};

// Make sure all of our partials are registered
registerPartials();

// Watch a directory or file
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

      if (extension === settings.baseExtension) {
        compile(filePath);
        return;
      }

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
      console.log('watching setup successfully');
    }
});

// On program start and any time a partial is added register
// everything in the partials dir
function registerPartials() {
  fs.readdirSync(settings.partialDir).forEach(function(file) {
    var base = path.basename(file, path.extname(file)); // strips file extension from file name
    Handlebars.registerPartial(base, fs.readFileSync(path.join(settings.partialDir, file), 'utf8'));
  });
}

// Run our file through handlebars and write the output
// to a new file
function compile(filePath) {
  fs.readFile(filePath, 'utf8', function(err, data) {
    var source, template, context, html;

    if (err) return console.log(err);

    source = data;
    template = Handlebars.compile(source);
    context = require('./' + path.join(settings.contextDir, path.basename(filePath, settings.baseExtension)));
    html = template(context);

    fs.writeFile(path.join(settings.outputDir, path.basename(filePath)), html, function (err) {
      if (err) return console.log(err);
      console.log(filePath + ' > ' + path.join(settings.outputDir, path.basename(filePath)));
    });
  });
}
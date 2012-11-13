# Tessellate

Tessellate watches your project directory and writes your handlebars templates to static files on save. This is great for designing in code when you want to reuse elements across multiple pages. Tessellate is intended for folks who don't want to or are not comfortable writing a bunch of JavaScript. Instead you can follow the patterns laid out in the example to have a project of reusable elements which render to static files.

## TODO

- Tidy HTML?
- Register partials on a new .handlebars event
- Indicate the name of a missing partial

## Guide

OK first thing's first. `npm install -g tessellate`

Navigate into a project directory and run `tessellate` from the command line. Tessellate is now watching your project, keeping an eye out for any handlebars tags that it can compile.

It's probably a good idea to clone this repo or download the zip so you can access the example project. The example project shows off some of the features supported by tessellate.

### Partials

To add a partial to your page just use the `{{> }}` handlebars syntax.

```
<!DOCTYPE html>
<html lang="en">
    {{> head }}
  <body>
    <div class="bugsz">
      <p></p>
    </div>
    {{> menu }}
  </body>
</html>
```

By default Tessellate will look for your partials in a folder called `partials/`. You can change this path by running Tessellate with the `-p` flag.

### Context

If you want to pass some data to a tessellate template just create a CommonJS file with the same name as your page. For instance, if your page is called `foobar.html` create a JS file called `foobar.js`. By default Tessellate will look for context files in a directory called `contexts/`. You can change this path by running Tessellate with the `-c` flag.

### Getting Help


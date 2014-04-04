/* jshint node:true */

// Don't run this configuration inside browserify.
if (process.browser) {
  return;
}

var Backbone = require("backbone");
var _ = require("underscore");
var fs = require("fs");

// Configure LayoutManager with some very useful defaults for Node.js
// environments.  This allows the end user to simply consume instead of
// fighting with the desirable configuration.

Backbone.Layout.configure({
  // Sensible default for Node.js is to load templates from the filesystem.
  // This is similar to how we default to script tags in browser-land.
  fetchTemplate: function(template) {
    // Automatically add the `.html` extension.
    template = template + ".html";

    // Put this fetch into `async` mode to work better in the Node environment.
    var done = this.async();

    // By default read in the file from the filesystem relative to the code
    // being executed.
    fs.readFile(template, function(err, contents) {
      // Ensure the contents are a String.
      contents = String(contents);

      // Any errors should be reported.
      if (err) {
        console.error("Unable to load file " + template + " : " + err);

        return done(null);
      }

      // Pass the template contents back up.
      done(_.template(contents));
    });
  }
});
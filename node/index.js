var fs = require("fs");

// Common dependencies to get LayoutManager running.
var Backbone = require("backbone");
var _ = require("underscore");

// Using Cheerio instead of jQuery, because Cheerio emulates a loosely
// compatible API that we further augment to ensure unit tests pass.  It is
// also much faster than jsdom.
var $ = require("cheerio");

// This is to avoid unwanted errors thrown when using
// `Backbone.View#setElement`.
$.prototype.unbind = $.prototype.off = function() { return this; };

// Since jQuery is not being used and LayoutManager depends on a Promise
// implementation close to jQuery, we use `underscore.deferred` here which
// matches jQuery's Deferred API exactly.  This is mixed into Cheerio to make
// it more seamless.
_.extend($, require("underscore.deferred"));

// Get Backbone and _ into the global scope.
_.defaults(global, { Backbone: Backbone, _: _ });

// Set the Backbone DOM library to be Cheerio.
Backbone.$ = $;

// Include the LayoutManager source, without eval.
require("../backbone.layoutmanager");

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
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  partial: function($root, $el, rentManager, manager) {
    var $filtered;

    // If selector is specified, attempt to find it.
    if (manager.selector) {
      if (rentManager.noel) {
        $filtered = $root.filter(manager.selector);
        $root = $filtered.length ? $filtered : $root.find(manager.selector);
      } else {
        $root = $root.find(manager.selector);
      }
    }

    // If no root found, return false.
    if (!$root.length) {
      return false;
    }

    // Use the insert method if the parent's `insert` argument is true.
    if (rentManager.insert) {
      this.insert($root, $el);
    } else {
      this.html($root, $el);
    }

    // If successfully added, return true.
    return true;
  }
});

module.exports = Backbone.Layout;

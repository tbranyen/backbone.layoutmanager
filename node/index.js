var fs = require("fs");
var util = require("util");

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

// Set a basic trim function to allow trimming whitespace from a template
$.trim = function(str) { return str.trim(); };

// Since jQuery is not being used and LayoutManager depends on a Promise
// implementation close to jQuery, we use `underscore.deferred` here which
// matches jQuery's Deferred API exactly.
var def = require("underscore.deferred");

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
  deferred: function() {
    return def.Deferred();
  },

  fetch: function(path) {
    var done = this.async();

    fs.readFile(path, function(err, contents) {
      if (err) {
        console.error("Unable to load file " + path + " : " + err);

        return done(null);
      }

      done(_.template(contents.toString()));
    });
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  partial: function($root, $el, rentManager, manager) {
    // If selector is specified, attempt to find it.
    if (manager.selector) {
      if (rentManager.noel) {
        var $filtered = $root.filter(manager.selector);
        $root = $filtered.length ? $filtered : $root.find(manager.selector);
      } else {
        $root = $root.find(manager.selector);
      }
    }

    // If no root found, return false.
    if (!$root.length) {
      return false;
    }

    // Use the insert method if `insert` argument is true.
    if (manager.insert) {
      this.insert($root, $el);
    } else {
      this.html($root, $el);
    }

    // If successfully added, return true.
    return true;
  },

  when: function(promises) {
    return def.when.apply(null, promises);
  },

  contains: $.contains

});

module.exports = Backbone.Layout;

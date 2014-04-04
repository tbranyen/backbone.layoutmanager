/* jshint node:true */
// Common dependencies to get LayoutManager running.
var Backbone = require("backbone");
var _ = require("underscore");

// Using Cheerio instead of jQuery, because Cheerio emulates a loosely
// compatible API that we further augment to ensure unit tests pass.  It is
// also much faster than jsdom.
// If this is browserify, this will resolve to jquery.
var $ = require("cheerio");

// If we're in a raw node environment (not browserify), we need to juggle
// a few dependencies. Inside package.json, we use the "browser" config
// to use jquery instead of cheerio so everything works right in the browser.
if (!process.browser){
  // This is to avoid unwanted errors thrown when using
  // `Backbone.View#setElement`.
  $.prototype.unbind = $.prototype.off = function() { return this; };

  // Since jQuery is not being used and LayoutManager depends on a Promise
  // implementation close to jQuery, we use `underscore.deferred` here which
  // matches jQuery's Deferred API exactly.  This is mixed into Cheerio to make
  // it more seamless.
  _.extend($, require("underscore.deferred"));
} else {
  // In browserify, put jquery into the global scope if it's not there already.
  _.defaults(global, { $: $ });
}

// Get Backbone and _ into the global scope.
_.defaults(global, { Backbone: Backbone, _: _ });

// Set the Backbone DOM library to be Cheerio/jQuery.
Backbone.$ = $;
(function(window) {
"use strict";

/*
 * Test Module: Expose
 * Ensures that LayoutManager is exposed properly.
 *
 */
QUnit.module("expose", {
  setup: function() {
    // Backbone.Layout constructor for convenience.
    this.Layout = Backbone.Layout;
    // Backbone.LayoutManager constructor for main usage.
    this.LayoutManager = Backbone.LayoutManager;
  }
});

asyncTest("AMD support", 1, function() {
  var requirejs = require;
  var useLM = true;

  // Node
  if (!window.define) {
    requirejs = require("requirejs");
    useLM = false;
  }

  requirejs.config({
    baseUrl: "../",

    paths: {
      underscore: "node_modules/underscore/underscore",
      jquery: "node_modules/jquery/dist/jquery",
      backbone: "node_modules/backbone/backbone"
    }
  });

  if (!useLM) {
    requirejs.define("backbone.layoutmanager", function() {
      return require("../../");
    });
  }

  requirejs(["backbone.layoutmanager"], function(LayoutManager) {
    ok(LayoutManager.VERSION, "Version property exists");

    start();
  });
});

// Ensure the correct defaults are set for all Layout and View options.
test("attached", 2, function() {
  // Layout should be a function.
  ok(_.isFunction(this.Layout), "Layout shortcut is a function");
  // LayoutManager should be a function.
  ok(!_.isFunction(this.LayoutManager),
    "LayoutManager shortcut is not a function");
});

// Browser only - ensure browserified module can be loaded
if (window.define) {
  asyncTest("Browserify support", 2, function() {
    var requirejs = require;
    // Ensure that the browserify-built LM version works.
    requirejs(["test/tmp/backbone.layoutmanager.browserify"], function(LayoutManager) {
      ok(LayoutManager.VERSION, "Version property exists");

      // Create a new layout with a sample template.
      var layout = new LayoutManager({
        template: testUtil.templates.main
      });

      // Render and check.
      layout.render().promise().then(function() {
        equal(this.$el.html().trim(), "Left", "Correct render output.");
        start();
      });
    });
  });
}


})(typeof global !== "undefined" ? global : this);

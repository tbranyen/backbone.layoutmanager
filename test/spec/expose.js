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

  if (!window.define) {
    requirejs = require("requirejs");
    useLM = false;
  }

  requirejs.config({
    baseUrl: "../",

    paths: {
      underscore: "bower_components/underscore/underscore",
      jquery: "bower_components/jquery/jquery",
      backbone: "bower_components/backbone/backbone"
    },

    shim: {
      underscore: { exports: "_" },
      backbone: {
        deps: ["jquery", "underscore"],
        exports: "Backbone"
      },

      "backbone.layoutmanager": useLM || {
        deps: ["backbone","jquery","underscore"],
        exports: "Backbone.LayoutManager"
      }
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

})(typeof global !== "undefined" ? global : this);

(function() {
"use strict";

/* 
 * Test Module: Configure
 * Ensures that configuration settings have correct defaults, initialization,
 * overriding, and functionality.
 *
 */
QUnit.module("configure", {
  setup: function() {
    this.LM = require("../../");
  }
});

// Ensure the correct defaults are set for all Layout and View options.
asyncTest("can render a basic template", 1, function() {
  // Create a new layout with a sample template.
  var layout = new this.LM({ template: "test/templates/test" });

  // Render and check.
  layout.render().promise().then(function() {
    equal(this.$el.html().trim(), "Sample template.", "Correct render output.");
    start();
  });
});

})();

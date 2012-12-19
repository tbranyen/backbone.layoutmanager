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

// Ensure the correct defaults are set for all Layout and View options.
test("attached", 2, function() {
  // Layout should be a function.
  ok(_.isFunction(this.Layout), "Layout shortcut is a function");
  // LayoutManager should be a function.
  ok(!_.isFunction(this.LayoutManager),
    "LayoutManager shortcut is not a function");
});

/* 
 * Test Module: Configure
 * Ensures that configuration settings have correct defaults, initialization,
 * overriding, and functionality.
 *
 */
module("configure", {
  setup: function() {
    // Backbone.LayoutManager constructor.
    this.Layout = Backbone.Layout;

    // Normal Backbone.View.
    this.View = Backbone.View.extend({
      initialize: function(options) {
        // Set up this View with LayoutManager.
        Backbone.LayoutManager.setupView(this, options);
      }
    });
  },

  teardown: function() {
    // Ensure the paths object is restored correctly.
    this.Layout.prototype.options.paths = {};
  }
});

// Ensure the correct defaults are set for all Layout and View options.
test("defaults", 16, function() {
  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new Layout to test.
  var view = new this.View();

  // Paths should be an empty object.
  deepEqual(layout.options.paths, {}, "Layout: No paths");
  // The deferred property should be a function.
  ok(_.isFunction(layout.options.deferred), "Layout: deferred is a function");
  // The fetch property should be a function.
  ok(_.isFunction(layout.options.fetch), "Layout: fetch is a function");
  // The partial property should be a function.
  ok(_.isFunction(layout.options.partial), "Layout: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(layout.options.html), "Layout: html is a function");
  // The append property should be a function.
  ok(_.isFunction(layout.options.append), "Layout: append is a function");
  // The when property should be a function.
  ok(_.isFunction(layout.options.when), "Layout: when is a function");
  // The render property should be a function.
  ok(_.isFunction(layout.options.render), "Layout: render is a function");
  // Paths should be an empty object.
  deepEqual(view.options.paths, {}, "View: No paths");
  // The deferred property should be a function.
  ok(_.isFunction(view.options.deferred), "View: deferred is a function");
  // The fetch property should be a function.
  ok(_.isFunction(view.options.fetch), "View: fetch is a function");
  // The partial property should be a function.
  ok(_.isFunction(view.options.partial), "View: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(view.options.html), "View: html is a function");
  // The append property should be a function.
  ok(_.isFunction(view.options.append), "View: append is a function");
  // The when property should be a function.
  ok(_.isFunction(view.options.when), "View: when is a function");
  // The render property should be a function.
  ok(_.isFunction(view.options.render), "View: render is a function");
});

// Do not allow invalid option assignments to go through.
test("invalid", 2, function() {
  // Configure an invalid property.
  Backbone.LayoutManager.configure("key", "val");

  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new View to test.
  var view = new this.View();

  // The assignment should yield undefined since it was invalid inside all
  // Layouts.
  equal(layout.options.key, undefined, "Layout: Invalid assignment");
  // The assignment should yield undefined since it was invalid inside all
  // Views.
  equal(view.options.key, undefined, "View: Invalid assignment");
});

// Test overriding a single property to ensure propagation works as expected.
test("global", 3, function() {
  // Configure paths property globally.
  Backbone.LayoutManager.configure({
    paths: {
      template: "/templates/"
    }
  });

  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new View to test.
  var view = new this.View();

  // The template property set inside paths should be default for all new
  // Layouts.
  equal(layout.options.paths.template, "/templates/",
    "Layout: Override paths globally for Layouts");
  // The template property set inside paths should be default for all new
  // Views.
  equal(view.options.paths.template, "/templates/",
    "View: Override paths globally for Views");
  // Ensure the global configuration was updated to reflect this update.
  equal(this.Layout.prototype.options.paths.template, "/templates/",
    "Override globals");
});

// Ensure that options can be overwritten at an instance level and make sure
// that this does not impact the global configuration.
test("override", 3, function() {
  // Create a new Layout to test.
  var layout = new this.Layout({
    paths: {
      layout: "/templates/layouts/"
    }
  });
  // Create a new View to test.
  var view = new this.View({
    paths: {
      template: "/templates/raw/"
    }
  });

  // The paths.layout property should be successfully overwritten for the
  // Layout instance.
  equal(layout.options.paths.layout, "/templates/layouts/",
    "Override paths locally");
  // The paths.template property should be successfully overwritten for the
  // View instance.
  equal(view.options.paths.template, "/templates/raw/",
    "Override paths locally");
  // Ensure the global configuration was NOT updated, local change only.
  notEqual(Backbone.LayoutManager.prototype.options.paths.template,
    "/templates/", "Do not override globals");
});

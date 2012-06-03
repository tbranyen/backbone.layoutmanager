/* 
 * Test Module: Setup
 * Ensures that Layouts and Views can be set up correctly to work with
 * LayoutManager.
 *
 */
module("setup", {
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

    // Shortcut the setupView function.
    this.setupView = this.Layout.setupView;
  }
});

test("layout constructor", 7, function() {
  var layout = new this.Layout({
    template: "test"
  });

  // Is a Backbone.View.
  ok(layout instanceof Backbone.View, "Is a Backbone.View");
  // Ensure the layout has a views object container.
  ok(_.isObject(layout.views), "Contains a views object");
  // Ensure the layout has a __manager__ object.
  ok(_.isObject(layout.__manager__), "Contains a __manager__ object");
  // Has the correct template property set.
  equal(layout.options.template, "test", "Has the correct template property");
  // Has the setViews function.
  ok(_.isFunction(layout.setViews), "Has the setViews function");
  // Has the view function.
  ok(_.isFunction(layout.setView), "Has the setView function");
  // Has the _options function.
  ok(_.isFunction(layout._options), "Has the _options function");
});

test("view setupView", 7, function() {
  var view = new this.View({
    template: "test"
  });

  // Is a Backbone.View.
  ok(view instanceof Backbone.View, "Is a Backbone.View");
  // Ensure the view has a views object container.
  ok(_.isObject(view.views), "Contains a views object");
  // Ensure the view has a __manager__ object.
  ok(_.isObject(view.__manager__), "Contains a __manager__ object");
  // Has the correct template property set.
  equal(view.options.template, "test", "Has the correct template property");
  // Has the setViews function.
  ok(_.isFunction(view.setViews), "Has the setViews function");
  // Has the view function.
  ok(_.isFunction(view.setView), "Has the setView function");
  // Has the _options function.
  ok(_.isFunction(view._options), "Has the _options function");
});

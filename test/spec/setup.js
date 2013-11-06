(function() {
"use strict";

/*
 * Test Module: Setup
 * Ensures that Layouts and Views can be set up correctly to work with
 * LayoutManager.
 *
 */
QUnit.module("setup", {
  setup: function() {
    // Backbone.LayoutManager constructor.
    this.Layout = Backbone.Layout;

    // Enhanced Backbone.View.
    this.View = Backbone.View.extend({
      manage: true
    });

    // Normal Backbone.View.
    this.NormalView = Backbone.View.extend();

    // Shortcut the setupView function.
    this.setupView = this.Layout.setupView;
  }
});

test("layout constructor", 6, function() {
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
});

test("view setupView", 7, function() {
  var view = new this.View({
    template: "test"
  });

  // Is a Backbone.View.
  ok(view instanceof Backbone.View, "Is a Backbone.View");
  // Ensure the view has a views object container.
  ok(_.isObject(view.views), "Contains a views object");
  // Ensure the view has a sections object container
  ok(_.isObject(view.sections), "Contains a sections object");
  // Ensure the view has a __manager__ object.
  ok(_.isObject(view.__manager__), "Contains a __manager__ object");
  // Has the correct template property set.
  equal(view.options.template, "test", "Has the correct template property");
  // Has the setViews function.
  ok(_.isFunction(view.setViews), "Has the setViews function");
  // Has the view function.
  ok(_.isFunction(view.setView), "Has the setView function");
});

test("setupView does not copy all options to instance", 1, function() {
  var view = new Backbone.View({
    test: "this"
  });

  Backbone.Layout.setupView(view);

  notEqual(view.test, "this", "View should not have options copied to instance");
});

test("Error exception is properly raised when vanilla View is used", 1, function() {
  var layout = new this.Layout({
    template: "test"
  });

  var view = new this.NormalView();

  try {
    layout.insertView(view);
  } catch (ex) {

    equal(ex.message, "The argument associated with selector '' is defined and a View.  Set `manage` property to true for Backbone.View instances.", "Correct message");
  }
});

test("`setView` exists on `Backbone.View` with `manage:true` set", 1, function() {
  var view = new Backbone.View({ manage: true });

  equal(typeof view.setView, "function", "setView is a function");
});

})();

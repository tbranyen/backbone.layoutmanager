(function(window) {
"use strict";

/* 
 * Test Module: Configure
 * Ensures that configuration settings have correct defaults, initialization,
 * overriding, and functionality.
 *
 */
QUnit.module("configure", {
  setup: function() {
    // Backbone.Layout constructor.
    this.Layout = Backbone.Layout;

    // Save a copy of console.warn.
    this.warn = window.console.warn;
  },

  teardown: function() {
    // Ensure the prefix object is restored correctly.
    this.Layout.prototype.prefix = "";

    // Remove `serialize` option.
    delete this.Layout.prototype.serialize;

    // Remove `el: false`.
    delete this.Layout.prototype.el;

    // Remove `supressWarnings: true`.
    delete this.Layout.prototype.suppressWarnings;

    // Not necessary for our testing purposes.
    window.console.trace = function() {};

    // Restore console.warn.
    window.console.warn = this.warn;
    delete this.warn;
  }
});

// Ensure the correct defaults are set for all Layout options.
test("defaults", 9, function() {
  // Create a new Layout to test.
  var layout = new this.Layout();

  // Paths should be an empty object.
  deepEqual(layout.prefix, "", "Layout: No prefix");
  // The deferred property should be a function.
  ok(_.isFunction(layout.deferred), "Layout: deferred is a function");
  // The fetch property should be a function.
  ok(_.isFunction(layout.fetch), "Layout: fetch is a function");
  // The partial property should be a function.
  ok(_.isFunction(layout.partial), "Layout: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(layout.html), "Layout: html is a function");
  // The insert property should be a function.
  ok(_.isFunction(layout.insert), "Layout: insert is a function");
  // The append property should be a function.
  ok(_.isFunction(layout.insert), "Layout: append is a function");
  // The when property should be a function.
  ok(_.isFunction(layout.when), "Layout: when is a function");
  // The render property should be a function.
  ok(_.isFunction(layout.renderTemplate), "Layout: renderTemplate is a function");
});

// Test overriding a single property to ensure propagation works as expected.
test("global", 2, function() {
  // Configure prefix property globally.
  Backbone.Layout.configure({
    prefix: "/templates/"
  });

  // Create a new Layout to test.
  var layout = new this.Layout();

  // The template property set inside prefix should be default for all new
  // Layouts.
  equal(layout.prefix, "/templates/",
    "Layout: Override paths globally for Layouts");
  // Ensure the global configuration was updated to reflect this update.
  equal(this.Layout.prototype.prefix, "/templates/", "Override globals");
});

// Ensure that options can be overwritten at an instance level and make sure
// that this does not impact the global configuration.
test("override at invocation", 2, function() {
  // Create a new Layout to test.
  var layout = new this.Layout({
    prefix: "/templates/layouts/"
  });

  // The prefix property should be successfully overwritten for the Layout
  // instance.
  equal(layout.prefix, "/templates/layouts/", "Override paths locally on Layout");
  // Ensure the global configuration was NOT updated, local change only.
  notEqual(Backbone.Layout.prototype.prefix,
    "/templates/", "Do not override globals");
});

// Render broke in 0.5.1 so this test will ensure this always works.
test("override render", 1, function() {
  var hit = false;

  var layout = new Backbone.Layout({
    template: _.template(testUtil.templates.main),
    fetch: _.identity,

    renderTemplate: function() {
      hit = true;
    }
  });

  layout.render().promise().then(function() {
    ok(hit, "The render method was hit correctly");
  });
});

test("Fetch works on a View during definition", 1, function() {
  var hit = false;

  var View = Backbone.Layout.extend({
    // A template is required to hit fetch.
    template: "a",

    fetch: function() {
      hit = true;
    }
  });
  
  new View().render().promise().then(function() {
    ok(hit, "Fetch gets called on a View.");
  });
});

test("Fetch works on a View during invocation", 1, function() {
  var hit = false;

  new Backbone.Layout({
    // A template is required to hit fetch.
    template: "a",

    fetch: function() {
      hit = true;
    }
  }).render().promise().then(function() {
    ok(hit, "Fetch gets called on a View.");
  });
});

test("Collection should exist on the View", 1, function() {
  var m = new Backbone.Collection();
  var D = Backbone.Layout.extend({
    initialize: function() {
      this.collection.reset([]);
      ok(true, "This works!");
    }
  });

  var V = Backbone.Layout.extend({
    template: "<p></p>",

    fetch: function(path) { return _.template(path); },

    initialize: function() {
      this.setViews({
        p: new D({ collection: this.collection })
      });
    }
  });

  var v = new V({
    collection: m
  });

  v.render();
});

test("Custom template function", 1, function() {
  var T = Backbone.Layout.extend({
    template: function(contents) {
      return contents;
    },

    serialize: "hi"
  });

  new T().render().promise().done(function() {
    equal(testUtil.trim(this.$el.text()), "hi", "Correct text");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/201
test("Options passed at instance level overwritten by class level options.", 2, function() {
  var layout = new Backbone.Layout();
  var TestView = Backbone.Layout.extend({
    template: "template-one",
    lol: "test"
  });

  layout.setView("", new TestView({ template: "template-two", lol: "hi" }));

  equal(layout.getView("").template, "template-two", "Property overwritten properly");
  equal(layout.getView("").lol, "hi", "Property overwritten properly");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/209
test("If you use 'data' as a variable in a view it won't render", 1, function() {
  var Test = Backbone.Layout.extend({
    data: {},
    serialize: { name: "test" },
    fetch: _.identity,
    template: _.template("<%=name%>")
  });

  new Test().render().promise().done(function() {
    equal(this.$el.html(), "test", "Correct proeprty set.");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/237
test("View `serialize` not used", 1, function() {
  // Configure options.
  Backbone.Layout.configure({
    serialize: { top: true }
  });

  // Setup View.
  var View = Backbone.Layout.extend({
    template: _.template("<%=top%>"),
    fetch: _.identity,
    serialize: { top: false },

    renderTemplate: function(template, context) {
      equal(context.top, false, "Local serialize should override configure");
    }
  });

  // Render the View.
  new View().render();
});

test("Setting `el: false` globally works as expected", 2, function() {
  Backbone.Layout.configure({ el: false });

  var l = new Backbone.Layout();
  equal(l.__manager__.noel, true, "No element was triggered");

  var m = new Backbone.Layout({ el: true });
  ok(!m.__manager__.noel, "No element was overwritten");
});

test("Setting `suppressWarnings: true` works as expected", 3, function() {
  // Start by testing that warn works.
  var l = new Backbone.Layout({
    template: _.template("<h1></h1><b></b>"),
    el: false
  });

  window.console.warn = function() { ok(true, "This should be called"); };

  l.render();

  ok(!l.suppressWarnings, "New Views do not suppress warnings by default");

  // Globally configure.
  Backbone.Layout.configure({ suppressWarnings: true });

  // Now test warn suppression. 
  var m = new Backbone.Layout({
    template: _.template("<h1></h1><b></b>"),
    el: false,
    suppressWarnings: true
  });

  window.console.warn = function() { ok(false, "This should not be called"); };

  m.render();

  ok(m.suppressWarnings, "After globally configured, Views suppress warnings.");
});

})(typeof global !== "undefined" ? global : this);

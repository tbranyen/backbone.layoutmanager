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

    // Normal Backbone.View.
    this.View = Backbone.View.extend({
      initialize: function(options) {
        // Set up this View with Layout.
        Backbone.Layout.setupView(this, options);
      }
    });

    // Save a copy of console.warn.
    this.warn = window.console.warn;
  },

  teardown: function() {
    // Ensure the prefix object is restored correctly.
    this.Layout.prototype.prefix = "";

    // Remove `manage: true`.
    delete this.Layout.prototype.manage;
    delete Backbone.View.prototype.manage;

    // Remove `el: false`.
    delete this.Layout.prototype.el;
    delete Backbone.View.prototype.el;

    // Remove `supressWarnings: true`.
    delete this.Layout.prototype.suppressWarnings;
    delete Backbone.View.prototype.suppressWarnings;

    // Not necessary for our testing purposes.
    window.console.trace = function() {};

    // Restore console.warn.
    window.console.warn = this.warn;
    delete this.warn;
  }
});

// Ensure the correct defaults are set for all Layout and View options.
test("defaults", 19, function() {
  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new Layout to test.
  var view = new this.View();

  // Paths should be an empty object.
  deepEqual(layout.prefix, "", "Layout: No prefix");
  // The deferred property should be a function.
  ok(_.isFunction(layout.deferred), "Layout: deferred is a function");
  // The fetchTemplate property should be a function.
  ok(_.isFunction(layout.fetchTemplate), "Layout: fetchTemplate is a function");
  // The renderTemplate property should be a function.
  ok(_.isFunction(layout.renderTemplate), "Layout: renderTemplate is a function");
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
  // Paths should be an empty object.
  deepEqual(view.prefix, "", "View: No prefix");
  // The deferred property should be a function.
  ok(_.isFunction(view.deferred), "View: deferred is a function");
  // The fetchTemplate property should be a function.
  ok(_.isFunction(view.fetchTemplate), "View: fetchTemplate is a function");
  // The renderTemplate property should be a function.
  ok(_.isFunction(view.renderTemplate), "View: renderTemplate is a function");
  // The partial property should be a function.
  ok(_.isFunction(view.partial), "View: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(view.html), "View: html is a function");
  // The insert property should be a function.
  ok(_.isFunction(view.insert), "View: insert is a function");
  // The append property should be a function.
  ok(_.isFunction(view.insert), "View: append is a function");
  // The when property should be a function.
  ok(_.isFunction(view.when), "View: when is a function");
  // The serialize property should be a function.
  ok(_.isFunction(view.serialize), "View: serialize is a function");
});

// Test overriding a single property to ensure propagation works as expected.
test("global", 4, function() {
  // Configure prefix property globally.
  Backbone.Layout.configure({
    prefix: "/templates/",

    manage: true
  });

  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new View to test.
  var view = new this.View();

  // The template property set inside prefix should be default for all new
  // Layouts.
  equal(layout.prefix, "/templates/",
    "Layout: Override paths globally for Layouts");
  // The template property set inside paths should be default for all new
  // Views.
  equal(view.prefix, "/templates/",
    "View: Override paths globally for Views");
  // Ensure the global configuration was updated to reflect this update.
  equal(this.Layout.prototype.prefix, "/templates/",
    "Override globals");
  // Ensure that `manage: true` works.
  ok(this.Layout.prototype.manage, "Manage was set.");
});

// Ensure that options can be overwritten at an instance level and make sure
// that this does not impact the global configuration.
test("override at invocation", 3, function() {
  // Create a new Layout to test.
  var layout = new this.Layout({
    prefix: "/templates/layouts/"
  });
  // Create a new View to test.
  var view = new this.View({
    prefix: "/templates/raw/"
  });

  // The prefix property should be successfully overwritten for the
  // Layout instance.
  equal(layout.prefix, "/templates/layouts/",
    "Override paths locally");
  // The paths.template property should be successfully overwritten for the
  // View instance.
  equal(view.prefix, "/templates/raw/",
    "Override paths locally");
  // Ensure the global configuration was NOT updated, local change only.
  notEqual(Backbone.Layout.prototype.prefix,
    "/templates/", "Do not override globals");
});

// Render broke in 0.5.1 so this test will ensure this always works.
test("override renderTemplate", 1, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: _.template(testUtil.templates.main),
    fetchTemplate: _.identity,

    renderTemplate: function() {
      hit = true;
    }
  });

  layout.render().promise().then(function() {
    ok(hit, "The renderTemplate method was hit correctly");
  });
});

test("Fetch works on a View during definition", 1, function() {
  var hit = false;

  var View = Backbone.Layout.extend({
    // A template is required to hit fetchTemplate.
    template: "a",

    fetchTemplate: function() {
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
    // A template is required to hit fetchTemplate.
    template: "a",

    fetchTemplate: function() {
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

    fetchTemplate: function(path) { return _.template(path); },

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

asyncTest("Default `serialize` implementation", 2, function() {
  var T = Backbone.Layout.extend({
    fetchTemplate: function(t) { return t; }
  });
  var t = new T({
    template: _.template("bar")
  });
  var t2 = new T({
    model: new Backbone.Model({ name : "foo" }),
    template: _.template("<%= name %>")
  });
  t.when([
    t.render().promise().then(function() {
      equal(t.$el.html(), "bar", "Should not break rendering if no model is in use");
    }),
    t2.render().promise().then(function() {
      equal(t2.$el.html(), "foo", "Should pass model attributes to the template");
    })
  ]).then(start);
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/201
test("Options passed at instance level overwritten by class level options.", 2, function() {
  var layout = new Backbone.Layout();
  var TestView = Backbone.View.extend({
    template: "template-one",
    lol: "test",

    manage: true
  });

  layout.setView("", new TestView({ template: "template-two", lol: "hi" }));

  equal(layout.getView("").options.template, "template-two", "Property overwritten properly");
  equal(layout.getView("").options.lol, "hi", "Property overwritten properly");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/209
test("If you use 'data' as a variable in a view it won't render", 1, function() {
  var Test = Backbone.View.extend({
    manage: true,

    data: {},
    serialize: { name: "test" },
    fetchTemplate: _.identity,
    template: _.template("<%=name%>")
  });

  new Test().render().promise().done(function() {
    equal(this.$el.html(), "test", "Correct property set.");
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
    fetchTemplate: _.identity,
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

test("Setting `supppressWarnings: true` works as expected", 5, function() {
  // Start by testing that warn works.
  var l = new Backbone.Layout({
    template: _.template("<h1></h1><b></b>"),
    el: false
  });

  // Nothing errors if trace is undefined.
  window.console.trace = undefined;
  window.console.warn = function() { ok(true, "warn should be called"); };

  l.render();

  // Nothing errors if warn is undefined.
  window.console.trace = undefined;
  window.console.warn = undefined;

  l.render();

  window.console.warn = function() { ok(true, "warn should be called"); };
  window.console.trace = function() { ok(true, "trace should be called"); };

  l.render();

  ok(!l.__manager__.suppressWarnings, "New Views do not suppress warnings by default");

  // Globally configure.
  Backbone.Layout.configure({ suppressWarnings: true });

  // Now test warn suppression. 
  var m = new Backbone.Layout({
    template: _.template("<h1></h1><b></b>"),
    el: false,
    suppressWarnings: true
  });

  window.console.warn = function() { ok(false, "warn should not be called"); };
  window.console.trace = function() { ok(false, "trace should not be called"); };

  m.render();

  ok(m.__manager__.suppressWarnings, "After globally configured, Views suppress warnings.");
});

test("ensure `insertViews` sets a single View correctly", 2, function() {
  var view = new Backbone.Layout();

  view.insertViews({
    "": new Backbone.Layout({ test: "property" })
  });

  ok(_.isArray(view.views[""]), "Ensure the section is an array");
  equal(view.views[""][0].options.test, "property", "Correct View");
});

})(typeof global !== "undefined" ? global : this);

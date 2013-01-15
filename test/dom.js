"use strict";

QUnit.module("dom", {
  setup: function() {
    this.SubView = Backbone.Layout.extend({
      template: _.template(testUtil.templates.testSub),
      fetch: _.identity,

      serialize: function() {
        return { text: "Right" };
      }
    });
  }
});

asyncTest("use layout without a template property", function() {
  expect(1);

  var main = new Backbone.Layout({
    el: "#prefilled"
  });

  main.setViews({
    ".test": new this.SubView()
  });

  main.render().then(function() {
    equal(testUtil.trim( this.$(".test").text() ), "Right",
      "Able to use an existing DOM element");

    start();
  });
});

asyncTest("afterRender inside Document", function() {
  var inDocument = false;

  var ProblemView = Backbone.Layout.extend({
    template: "not-real",

    fetch: function() {
      setTimeout(this.async(), 10);
    },

    afterRender: function() {
      var doc = this.el.parentNode.parentNode.parentNode;
      inDocument = this.options.contains(doc, this.el);

      ok(inDocument, "element in is in the page Document");

      start();
    }
  });

  var NestedView = Backbone.Layout.extend({
    template: "not-real",

    fetch: function() {
      setTimeout(this.async(), 10);
    }
  });

  var NewView = Backbone.Layout.extend({
    template: "not-even-close-to-real",

    fetch: function() {
      setTimeout(this.async(), 20);
    },

    views: {
      "": new NestedView({
        views: {
          "": new ProblemView()
        }
      })
    }
  });

  var newView = new NewView();

  $("body").append(newView.el);

  newView.render();
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/118
test("events not correctly bound", 1, function() {
  var hit = false;

  var m = new Backbone.Model();

  var EventView = Backbone.Layout.extend({
    events: {
      click: "myFunc"
    },

    myFunc: function() {
      hit = true;
    },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.model.on("change", this.render, this);
    }
  });

  var Layout = Backbone.Layout.extend({
    template: "<p></p>",

    fetch: function(name) {
      return _.template(name);
    },

    beforeRender: function() {
      var eventView = this.insertView("p", new EventView({
        model: m
      }));
    }
  });

  var view = new Layout();

  view.$el.appendTo("#container");

  view.render().then(function() {
    view.views.p[0].$el.click();

    ok(hit, "Event was fired");
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/126
test("render works when called late", 1, function() {
  var hit = false;
  var A = Backbone.Model.extend({});
  var ACollection = Backbone.Collection.extend({ model: A });
  var View = Backbone.Layout.extend({
    template: "<div>Click Here</div>",
    className: "hitMe",

    fetch: function(path) {
      return _.template(path);
    },

    events: {
      click: "onClick"
    },

    initialize: function() {
      this.collection.on("reset", function() {
        this.render();
      }, this);
    },

    onClick: function() {
      hit = true;
    }
  });

  var collection = new ACollection([]);
  var layout = new Backbone.Layout({
      template: "<div class='button'></div>",

      fetch: function(path) {
        return _.template(path);
      },

      views: {
        ".button": new View({ collection: collection })
      }

  });

  layout.render();
  collection.reset([]);

  // Simulate click.
  layout.$(".hitMe").click();

  ok(hit, "render works as expected when called late");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/126
test("render works when assigned early", 1, function() {
  var hit = false;
  var A = Backbone.Model.extend({});
  var ACollection = Backbone.Collection.extend({ model: A });
  var View = Backbone.Layout.extend({
    template: "<div>Click Here</div>",
    className: "hitMe",

    fetch: function(path) {
      return _.template(path);
    },

    events: {
      click: "onClick"
    },

    initialize: function() {
      this.collection.on("reset", this.render, this);
    },

    onClick: function() {
      hit = true;
    }
  });

  var collection = new ACollection([]);
  var layout = new Backbone.Layout({
      template: "<div class='button'></div>",

      fetch: function(path) {
        return _.template(path);
      },

      views: {
        ".button": new View({ collection: collection })
      }

  });

  layout.render();

  collection.reset([]);

  // Simulate click.
  layout.$(".hitMe").click();

  ok(hit, "render works as expected when assigned early");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/134
test("Ensure events are copied over properly", 1, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    events: {
      "click p": "test"
    },

    test: function(ev) {
      hit = true;
    }
  });

  layout.render();

  layout.$("p").click();

  ok(hit, "Events were bound and triggered correctly");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/134
// https://github.com/tbranyen/backbone.layoutmanager/issues/139
asyncTest("events are bound correctly", 1, function() {
  var hit = 0;

  var l = new Backbone.Layout({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); }
  });

  l.render();

  var V = Backbone.Layout.extend({
    keep: true,
    template: "<span>hey</span>",
    fetch: function(path) { return _.template(path); },

    events: {
      click: "hit"
    },

    hit: function(ev) {
      hit++;
    }
  });

  // Insert two views.
  l.insertView("p", new V());
  l.insertView("p", new V());

  // Render twice.
  l.render();
  l.render().then(function() {
    l.$("p div").trigger("click");

    equal(hit, 2, "Event handler is bound and fired correctly");
    start();
  });
});

asyncTest("more events issues", 1, function() {
  var hit = 0;

  var V = Backbone.Layout.extend({
    template: "<span>hey</span>",
    fetch: function(path) { return _.template(path); },

    events: {
      click: "hit"
    },

    hit: function(ev) {
      hit++;
    }
  });

  var S = Backbone.Layout.extend({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    beforeRender: function() {
      // Insert two views.
      this.insertView("p", new V());
      this.insertView("p", new V());
    },

    reset: function() {
      this.render();
    }
  });

  // Create a sub-layout.
  var s = new S();

  // Create a main layout.
  var l = new Backbone.Layout({
    views: {
      "": s
    }
  });

  // Render the layout.
  l.render();

  // Re-render.
  s.reset();

  l.$("p div").trigger("click");

  equal(hit, 2, "Event handler is bound and fired correctly");
  start();
});

// Explicitly excersize the default `fetch` implementation (most tests override
// that functionality to use in-memory templates)
test("default `fetch` method retrieves template from element specified by DOM selector", 1, function() {

  var vyou = new Backbone.Layout({
    template: "#dom-template"
  });
  var expected, actual;

  vyou.render();

  expected = "This template lives in the <b>DOM</b>";
  actual = testUtil.trim(vyou.$el.html());

  equal(actual, expected, "Correctly fetches template string from the DOM");
});

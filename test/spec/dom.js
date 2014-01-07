(function() {
"use strict";

QUnit.module("dom", {
  setup: function() {
    this.LM = Backbone.Layout.extend();

    this.SubView = Backbone.Layout.extend({
      template: _.template(testUtil.templates.testSub),
      fetchTemplate: _.identity,

      serialize: function() {
        return { text: "Right" };
      }
    });
  }
});

asyncTest("test default fetchTemplate implementation", 1, function() {
  // Create a new layout with a sample template.
  var layout = new this.LM({ template: "#test" });

  // Render and check.
  layout.render().then(function() {
    equal(this.$el.html().trim(), "Sample template.", "Correct render output.");
    start();
  });
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

    fetchTemplate: function() {
      setTimeout(this.async(), 10);
    },

    afterRender: function() {
      var doc = document.body;
      inDocument = this.contains(doc, this.el);

      ok(inDocument, "element in is in the page Document");

      start();
    }
  });

  var NestedView = Backbone.Layout.extend({
    template: "not-real",

    fetchTemplate: function() {
      setTimeout(this.async(), 10);
    },

    beforeRender: function() {
      this.insertView(new ProblemView());
    }
  });

  var NewView = Backbone.Layout.extend({
    template: "not-even-close-to-real",

    fetchTemplate: function() {
      setTimeout(this.async(), 20);
    }
  });

  var newView = new NewView();

  $("body").append(newView.el);

  newView.insertView(new NestedView());
  newView.render();
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/118
asyncTest("events not correctly bound", 1, function() {
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

    fetchTemplate: function(name) {
      return _.template(name);
    },

    beforeRender: function() {
      this.insertView("p", new EventView({
        model: m
      }));
    }
  });

  var view = new Layout();

  view.$el.appendTo("#container");

  view.render().then(function() {
    view.views.p[0].$el.click();

    ok(hit, "Event was fired");
    start();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/126
asyncTest("render works when called late", 1, function() {
  var hit = false;
  var A = Backbone.Model.extend({});
  var ACollection = Backbone.Collection.extend({ model: A });
  var View = Backbone.Layout.extend({
    template: "<div>Click Here</div>",
    className: "hitMe",

    fetchTemplate: function(path) {
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

      fetchTemplate: function(path) {
        return _.template(path);
      },

      views: {
        ".button": new View({ collection: collection })
      }

  });

  layout.render().then(function(){
    layout.getView(".button").once("afterRender", function(){
      // Simulate click.
      layout.$(".hitMe").click();

      ok(hit, "render works as expected when called late");
      start();
    });
    collection.reset();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/126
asyncTest("render works when assigned early", 1, function() {
  var hit = false;
  var A = Backbone.Model.extend({});
  var ACollection = Backbone.Collection.extend({ model: A });
  var View = Backbone.Layout.extend({
    template: "<div>Click Here</div>",
    className: "hitMe",

    fetchTemplate: function(path) {
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

      fetchTemplate: function(path) {
        return _.template(path);
      },

      views: {
        ".button": new View({ collection: collection })
      }

  });

  layout.render().then(function(){
    layout.getView(".button").once("afterRender", function(){
      // Simulate click.
      layout.$(".hitMe").click();

      ok(hit, "render works as expected when assigned early");
      start();
    });
    collection.reset();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/134
asyncTest("Ensure events are copied over properly", 1, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

    events: {
      "click p": "test"
    },

    test: function() {
      hit = true;
    }
  });

  layout.render().then(function(){
    layout.$("p").click();

    ok(hit, "Events were bound and triggered correctly");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/134
// https://github.com/tbranyen/backbone.layoutmanager/issues/139
asyncTest("events are bound correctly", 1, function() {
  var hit = 0;

  var l = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  l.render();

  var V = Backbone.Layout.extend({
    keep: true,
    template: "<span>hey</span>",
    fetchTemplate: function(path) { return _.template(path); },

    events: {
      click: "hit"
    },

    hit: function() {
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
    fetchTemplate: function(path) { return _.template(path); },

    events: {
      click: "hit"
    },

    hit: function() {
      hit++;
    }
  });

  var S = Backbone.Layout.extend({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

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
  l.render().then(function(){
    s.once("afterRender", function(){
      l.$("p div").trigger("click");

      equal(hit, 2, "Event handler is bound and fired correctly");
      start();
    });
    
    // Re-render.
    s.reset();
  });
});

// Explicitly excersize the default `fetchTemplate` implementation (most tests override
// that functionality to use in-memory templates)
asyncTest("default `fetchTemplate` method retrieves template from element specified by DOM selector", 1, function() {

  var vyou = new Backbone.Layout({
    template: "#dom-template"
  });
  var expected, actual;

  vyou.render().then(function(){

    expected = "This template lives in the <b>DOM</b>";
    actual = testUtil.trim(vyou.$el.html());

    equal(actual, expected, "Correctly fetches template string from the DOM");
    start();
  });
});

asyncTest("events delegated correctly when managing your own view element", 1, function() {
  var view = new Backbone.View({
    manage: true, el: false,

    events: { "click": "onClick" },

    onClick: function() {
      this.clicked = true;
    },

    template: _.template(testUtil.templates.item),

    serialize: { text: "lol" }
  });

  view.render().then(function() {
    view.$el.click();
    equal(view.clicked, true, "onClick event was fired");
    start();
  });
});

asyncTest("afterRender callback is triggered too early", 2, function() {
  var inDocument = false;

  var ProblemView = Backbone.Layout.extend({
    template: "not-real",

    fetchTemplate: function() {
      setTimeout(this.async(), 10);
    },

    afterRender: function() {
      var doc = document.body;
      inDocument = $.contains(doc, this.el);

      ok(inDocument, "element in is in the page Document");
    }
  });

  var NewView = Backbone.Layout.extend({
    template: "not-real",

    fetchTemplate: function() {
      setTimeout(this.async(), 10);
    },

    beforeRender: function() {
      this.insertView(new ProblemView());
    }
  });

  var newView = new NewView();

  $("body").append(newView.el);

  newView.render().then(function() {
    newView.render().then(function() {
      start();
    });
  });
});

})();

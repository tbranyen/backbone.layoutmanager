(function() {
"use strict";
/*global testUtil, underscore, lodash */

//
// Test suite definitions.
//

function createOptions(options) {
  return {
    // Strict mode shuffling.
    setup: function() {
      return setup(this, options);
    },
    teardown: function() {
      return teardown(this);
    }
  };
}

QUnit.module("views (RAF: false, underscore)", createOptions({useRAF: false, _: underscore}));
defineTests();

QUnit.module("views (RAF: true, underscore)", createOptions({useRAF: true, _: underscore}));
defineTests();

QUnit.module("views (RAF: false, lodash)", createOptions({useRAF: false, _: lodash}));
defineTests();

QUnit.module("views (RAF: true, lodash)", createOptions({useRAF: true, _: lodash}));
defineTests();

//
// Setup and teardown definitions for each test suite.
//

function setup(testModule, globalOptions) {
  // Override the default template fetching behavior such that the tests can
  // run in the absence of the DOM (for Node.js). Store a reference to the
  // default `fetchTemplate` method to be restored in the teardown of this test
  // module.
  testModule.origFetch = Backbone.Layout.prototype.fetchTemplate;

  // keep a reference to the current utility library for mocking
  testModule._ = globalOptions._ || _;

  Backbone.Layout.configure(_.extend({
    fetchTemplate: function(name) {
      return _.template(testUtil.templates[name]);
    },
    suppressWarnings: true
  }, globalOptions));

  // Custom View
  testModule.View = Backbone.Layout.extend({
    template: "test",

    serialize: function() {
      return { text: this.msg };
    },

    initialize: function(opts) {
      this.msg = opts.msg;
    }
  });

  // Initialize View
  testModule.InitView = Backbone.Layout.extend({
    template: "test",

    serialize: function() {
      return { text: this.msg };
    },

    initialize: function(opts) {
      this.msg = opts.msg;

      this.setViews({
        ".inner-right": new testModule.SubView()
      });
    }
  });

  testModule.SubView = Backbone.Layout.extend({
    template: "testSub",

    serialize: function() {
      return { text: "Right" };
    }
  });

  testModule.EventedListView = Backbone.Layout.extend({
    template: "list",

    initialize: function() {
      this.collection.on("reset", this.render, this);
    },

    cleanup: function() {
      this.collection.off(null, null, this);
    },

    beforeRender: function() {
      this.collection.each(function(model) {
        this.insertView("ul", new testModule.ItemView({ model: model.toJSON() }));
      }, this);
    }
  });

  testModule.ListView = Backbone.Layout.extend({
    template: "list",

    beforeRender: function() {
      // Iterate over the passed collection and insert into the view
      _.each(this.collection, function(model) {
        this.insertView("ul", new testModule.ItemView({ model: model }));
      }, this);
    }
  });

  testModule.ItemView = Backbone.Layout.extend({
    template: "testSub",
    tagName: "li",

    serialize: function() {
      return this.model;
    }
  });
}

function teardown(testModule) {
  Backbone.Layout.configure({
    fetchTemplate: testModule.origFetch
  });

  // Remove `supressWarnings: true`.
  delete Backbone.Layout.prototype.suppressWarnings;
  delete Backbone.View.prototype.suppressWarnings;
}

// Wrapper around test declarations so we can run them twice,
// once with useRAF & once without.
function defineTests(){

asyncTest("render outside defined partial", 2, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  main.setView(".right", new this.View({
    msg: "Right"
  }));

  main.render().then(function() {
    var trimmed = testUtil.trim(this.$(".inner-left").html());

    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("render inside defined partial", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".right": new this.View({ msg: "Right" })
    }
  });

  main.render().then(function() {
    var trimmed = testUtil.trim( this.$(".inner-left").html() );

    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("Subclassed view uses correct template when rendered.", function() {
  expect(1);

  var layout = new Backbone.Layout();
  var BaseView = Backbone.View.extend({
    template: function() {
      return "Base view template";
    },
    manage: true
  });

  var templateFunction = function() {
    return "Extended view template";
  };

  var ExtendedBaseView = BaseView.extend({
    constructor: function() {
      this.template = templateFunction;
      BaseView.prototype.constructor.apply(this, arguments);
    }
  });

  layout.setView("", new ExtendedBaseView());

  layout.render().then(function() {
    var contents = testUtil.trim(this.$el.text());

    equal(contents, "Extended view template", "Correct template is used");
    start();
  });
});

asyncTest("re-render a view defined after initialization", function(){
  expect(2);

  var trimmed;
  var setup = this;

  var main = new Backbone.Layout({
    template: "main"
  });

  main.setView(".right", new this.View({ msg: "Right" }));

  main.render().then(function() {

    trimmed = testUtil.trim( this.$(".inner-left").html() );
    equal(trimmed, "Right", "Correct re-render");

    main.setView(".right", new setup.View({
      msg: "Right Again"
    })).render().then(function() {
      trimmed = testUtil.trim( this.$(".inner-left").html() );
      equal(trimmed, "Right Again", "Correct re-render");

      start();
    });
  });
});

asyncTest("nested views", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".right": new this.View({
        msg: "Left",

        views: {
          ".inner-right": new this.SubView({ lol: "hi" })
        }
      })
    }
  });

  main.render().then(function() {
    var trimmed = testUtil.trim(this.$(".inner-right div").html());

    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("serialize on Layout is a function", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "testSub",
    serialize: { text: testText }
  });

  main.render().then(function() {
    equal(testUtil.trim( this.$el.text() ), testText, "correct data");

    start();
  });
});

asyncTest("data on Layout is an object", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "testSub",
    serialize: { text: "test text" }
  });

  main.render().then(function() {
    equal(testUtil.trim( this.$el.text() ), testText, "correct data");

    start();
  });
});

// TODO THIS TEST
asyncTest("rendered event", function() {
  expect(4);

  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".right": new this.ListView({
        collection: [{ text: "one" }, { text: "two" }]
      })
    }
  });

  main.render().then(function() {
    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(this.$("ul li").length, 2, "Correct number of nested li's");
    equal(testUtil.trim( this.$("ul li").eq(0).html() ), "one",
      "Correct first li content");

    equal(testUtil.trim( this.$("ul li").eq(1).html() ), "two",
      "Correct second li content");

    start();
  });
});

asyncTest("insert views", function() {
  expect(4);

  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".right": new this.ListView({
        collection: [{ text: "one" }, { text: "two" }]
      })
    }
  });

  main.render().then(function() {
    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");

    equal(this.$("ul li").length, 2, "Correct number of nested li's");

    equal(testUtil.trim( this.$("ul li").eq(0).html() ), "one",
      "Correct first li content");

    equal(testUtil.trim( this.$("ul li").eq(1).html() ), "two",
      "Correct second li content");

    start();
  });
});

asyncTest("using setViews", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "main"
  });

  main.setViews({
    ".right": new this.View({
      msg: "Left",

      views: {
        ".inner-right": new this.SubView()
      }
    })
  });

  main.render().then(function() {
    var trimmed = testUtil.trim(this.$(".inner-right div").html());

    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("using setViews inside initialize", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "main"
  });

  main.setViews({
    ".right": new this.InitView({
      msg: "Left"
    })
  });

  main.render().then(function() {
    var trimmed = testUtil.trim( this.$(".inner-right div").html() );

    ok(testUtil.isDomNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("extend layoutmanager", 1, function() {
  var testText = "test text";

  var BaseLayout = Backbone.Layout.extend({
    template: "testSub",
    serialize: { text: "test text" }
  });

  var main = new BaseLayout();

  main.render().then(function() {
    equal(testUtil.trim( this.$el.text() ), testText, "correct data");

    start();
  });
});

asyncTest("appending views with array literal", 3, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  main.setViews({
    ".right": [
      new this.View({
        msg: "One",
        keep: true
      }),

      new this.View({
        msg: "Two",
        keep: true
      })
    ]
  });

  main.render().then(function() {
    equal(this.$(".right").children().length, 2, "correct children length");

    equal(testUtil.trim(this.$(".right").children().eq(0).text() ), "One",
      "correct value set for the first child");

    equal(testUtil.trim(this.$(".right").children().eq(1).text() ), "Two",
      "correct value set for the second child");

    start();
  });
});

asyncTest("single render per view", function() {
  expect(1);

  var count = 0;

  var main = new Backbone.Layout({
    template: "main"
  });

  var right = main.setView(".right", new this.View({
    msg: "1"
  }));

  // Level 1
  right.render().then(function() {
    count++;
  });

  // Level 2
  main.setView(".inner-right", new this.View({ msg: "2" })).render().then(function() {
    count++;
  });

  // Level 3
  var innerRight = main.views[".inner-right"];

  innerRight.setViews({
    ".inner-right": [ new this.SubView(), new this.SubView() ]
  });

  innerRight.views[".inner-right"][0].render().then(function() {
    count++;
  });

  innerRight.views[".inner-right"][1].render().then(function() {
    count++;
  });

  main.render().then(function() {
    equal(count, 4, "Render is only called once for each view");

    start();
  });
});

asyncTest("render callback and deferred context is view", 6, function() {
  // There is a really weird bug that occurs when using stop(2) instead
  // of this workaround. Appears to be something deep inside QUnit, caused by running
  // a test more than once. If we use stop(6) instead and start() inside the then calls below,
  // tests after this one will fail regularly.
  var endTest = _.after(6, start);

  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".right": new this.View({ msg: "Right" }),
      ".left": [
        new this.View({ keep: true, msg: "Left 1" }),
        new this.View({
            msg: "Left 2",
            keep: true,
            views: {
              ".inner-left": new this.SubView({ lol: "hi" })
            }
        })
      ]
    }
  });

  main.render().then(function() {
    equal(this, main, "Layout render callback context is Layout");
    endTest();
  }).then(function() {
    equal(this, main, "Layout render deferred context is Layout");
    endTest();
  });

  main.views[".right"].render().then(function() {
    equal(this, main.views[".right"], "View render callback context is View");
    endTest();
  }).then(function() {
    equal(this, main.views[".right"], "View render deferred context is View");
    endTest();
  });

  main.views[".left"][1].views[".inner-left"].render().then(function() {
    equal(this, main.views[".left"][1].views[".inner-left"],
      "Nested View render callback context is View");
    endTest();
  }).then(function() {
    equal(this, main.views[".left"][1].views[".inner-left"],
      "Nested View render deferred context is View");
    endTest();
  });
});

asyncTest("list items don't duplicate", 2, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  var view = main.setView(".right", new this.EventedListView({
    collection: new Backbone.Collection()
  }));

  view.collection.reset([ { text: 5 } ]);

  main.render().then(function() {
    view.collection.reset([ { text: 5 } ]);
  });

  view.collection.reset([ { text: 5 } ]);

  setTimeout(function() {
    view.collection.reset([
      { text: 1 },
      { text: 2 },
      { text: 3 },
      { text: 4 }
    ]);

    view.render().then(function() {
      equal(view.$("ul").children().length, 4, "Only four elements");
      equal(view.views.ul.length, 4, "Only four Views");

      start();
    });
  }, 5);
});

asyncTest("afterRender triggers for nested views", 1, function() {
  var triggered = false;
  var main = new Backbone.Layout({
    el: "#prefilled"
  });

  main.setViews({
    ".test": new this.SubView({
      serialize: { text: "Here" },

      afterRender: function() {
        triggered = true;
      }
    })
  });

  main.render().then(function() {
    ok(triggered === true, "afterRender is called");

    start();
  });
});

// Do this one without a custom render function as well.
asyncTest("view render can be attached inside initalize", 1, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  var TestRender = Backbone.View.extend({
    manage: true,

    initialize: function() {
      this.model.on("change", this.render, this);
    },

    beforeRender: function() {
      this.$el.html("This works now!");
    }
  });

  var testModel = new Backbone.Model();

  var testRender = main.setView(".right", new TestRender({
    model: testModel
  }));

  // Initial render.
  main.render().then(function() {
    equal(testRender.$el.html(), "This works now!", "Content correctly set");

    testRender.remove();

    start();
  });

  testModel.trigger("change");
});

test("Allow normal Views to co-exist with LM", 1, function() {
  var called = false;
  var View = Backbone.View.extend({
    render: function() {
      called = true;
    }
  });

  var view = new View();

  view.render();

  ok(called, "Render methods work without being in LM");
});

test("setView works going from append mode to normal", 1, function() {
  var main = new Backbone.Layout({
    template: "main",

    views: {
      ".left": [
        new this.View({ keep: true, msg: "Left 1" }),
        new this.View({
            msg: "Left 2",
            keep: true,
            views: {
              ".inner-left": new this.SubView({ lol: "hi" })
            }
        })
      ]
    }
  });

  main.setView(".left", new this.View({ msg: "Right" }));

  ok(true, "setView does not crash");
});

asyncTest("setView and insertView not working after model change", 1, function() {
  var setup = this;

  var m = new Backbone.Model();

  var View = Backbone.View.extend({
    manage: true,

    initialize: function() {
      this.model.on("change", function() {
        this.render().then(function(){
          equal(layout.$(".inner-left").length, 2, "rendered twice");
          start();
        });
      }, this);
    },

    beforeRender: function() {
      this.insertView(new setup.View({
        msg: "insert",

        // Need keep true.
        keep: true
      }));
    }
  });

  var view = new View({ model: m });

  var layout = new Backbone.Layout({
    template: "main",

    views: {
      ".left": view
    }
  });

  layout.render().then(function(){
    m.set("some", "change");
  });

});

asyncTest("Ensure afterRender can access element's parent.", 1, function() {
  var view = new Backbone.Layout({
    template: "main",

    views: {
      ".left": new Backbone.Layout({
        afterRender: function() {
          ok(this.contains(view.el, this.el),
            "Parent can be found in afterRender");

          start();
        }
      })
    }
  });

  view.render();
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/108
asyncTest("render callback vs deferred resolve when called twice", 1, function() {
  // Create a new View.
  var view = new Backbone.View();

  // Set it up to work with Layout.
  Backbone.Layout.setupView(view);

  // Two renders using callback style.
  view.render().then(function() {
    view.render().then(function() {
      ok(true, "Two render's using callback style work.");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/115
test("Uncaught RangeError: Maximum call stack size exceeded", 1, function() {
  var View = Backbone.View.extend({
    manage: true
  });

  new View({
    model: new Backbone.Model()
  }).render();

  ok(true, "No call stack exceeded error");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/117
asyncTest("Views getting appended in the wrong order", 3, function() {
  var View = Backbone.View.extend({
    manage: true,

    template: "testing",

    fetchTemplate: function(name) {
      var done = this.async();

      setTimeout(function() {
        done( _.template(name));
      }, Math.random()*5);
    }
  });

  var view = new View({
    views: {
      "": [ new View({ order: 1 }), new View({ order: 2 }) ]
    }
  });

  view.render().then(function() {
    equal(this.views[""].length, 2, "There should be two views");
    equal(this.views[""][0].options.order, 1, "The first order should be 1");
    equal(this.views[""][1].options.order, 2, "The second order should be 2");
    start();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/116
asyncTest("Re-rendering of inserted views causes append at the end of the list", 1, function() {
  var ItemView = Backbone.Layout.extend({
    tagName: "tr",

    template: "<%= msg %>",

    fetchTemplate: function(name) {
      return _.template(name);
    },

    serialize: function() {
      return { msg: this.options.msg };
    }
  });

  var item1 = new ItemView({ msg: "hello" });
  var item2 = new ItemView({ msg: "goodbye" });

  var list = new Backbone.Layout({
    template: "<tbody></tbody>",

    fetchTemplate: function(name) {
      return _.template(name);
    },

    beforeRender: function() {
      this.insertView("tbody", item1);
      this.insertView("tbody", item2);
    }
  });

  var main = new Backbone.Layout({
    tagName: "table"
  });

  main.insertView(list);

  main.render().then(function() {
    list.views.tbody[0].render().then(function() {
      var $tr = main.$("tbody").first().find("tr");

      equal($tr.html(), "hello", "Correct tbody order.");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/122
asyncTest("afterRender() not called on item added with insertView()", 2, function() {
  var hitAfter = 0;
  var hitBefore = 0;

  var m = new Backbone.Model();

  var Item = Backbone.Layout.extend({
    template: "",

    fetchTemplate: function(path) {
      return _.template(path);
    },

    tagName: "tr",

    beforeRender: function() {
      hitBefore = hitBefore + 1;
    },

    afterRender: function() {
      hitAfter = hitAfter + 1;
    },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.model.on("change", this.render, this);
    }
  });

  var List = Backbone.Layout.extend({
    template: "<tbody></tbody>",

    fetchTemplate: function(path) {
      return _.template(path);
    },

    beforeRender: function() {
      // Pass the model through.
      this.insertView("tbody", new Item({ model: m }));
    }
  });

  var list = new List({ model: m });

  list.render().then(function() {
    list.getView("tbody").once("afterRender", function(){
      equal(hitBefore, 2, "beforeRender hit twice");
      equal(hitAfter, 2, "afterRender hit twice");
      start();
    });

    m.set("something", "changed");
  });
});

asyncTest("Render doesn't work inside insertView", 1, function() {
  var V = Backbone.Layout.extend({
    template: "<p class='inner'><%= lol %></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  var n = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  n.render().then(function(){
    n.insertView("p", new V({ serialize: { lol: "hi" } })).render().then(function(){
      equal(n.$("p.inner").html(), "hi", "Render works with insertView");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/131
test("Ensure global paths are adhered to", 1, function() {
    Backbone.Layout.configure({
      prefix: "test/"
    });

    var t = new Backbone.Layout({
      template: "here"
    });

    equal(t.prefix, "test/", "Prefix properly hooked up");

    Backbone.Layout.configure({
      prefix: ""
    });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/137
asyncTest("afterRender not firing", 1, function() {
  var hit = false;
  var l = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  l.render().then(function(){
    var V = Backbone.Layout.extend({
      template: "<span>hey</span>",
      fetchTemplate: function(path) { return _.template(path); },

      afterRender: function() {
        hit = true;
      }
    });

    l.setView("p", new V()).render().then(function(){
      ok(hit, "afterRender was hit successfully");
      start();
    });
  });

});

asyncTest("multiple subclasses afterRender works", 1, function() {
  var hit = 0;
  var SubClass1 = Backbone.Layout.extend({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

    afterRender: function() {
      hit--;
    }
  });

  var SubClass2 = SubClass1.extend({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

    afterRender: function lol() {
      hit++;
    }
  });

  var ParentTest = Backbone.Layout.extend({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

    beforeRender: function() {
      this.setView("", new SubClass2());
    }
  });

  var Test = Backbone.Layout.extend({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); },

    triggerRender: function() {
      return this.insertView("p", new ParentTest()).render();
    }
  });

  var test = new Test();
  test.render().then(function() {
    test.triggerRender().then(function(){
      equal(hit, 1, "Hit was correctly fired once");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/148
asyncTest("Views cannot be removed once added to a Layout", 3, function() {
  var v;

  var Child = Backbone.Layout.extend({
    className: "child"
  });

  var layout = new Backbone.Layout();
  v = layout.setView("", new Child());

  layout.render().then(function(){
    equal(layout.$(".child").length, 1, "Only one child");

    v.remove();
    equal(layout.$(".child").length, 0, "No children");

    layout.render().then(function(){
      equal(layout.$(".child").length, 0, "No children");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/150
asyncTest("Views intermittently render multiple times", 1, function() {
  // Simulating fetchTemplate, should only execute once per template and then cache.
  var fetchTemplate = function(name) {
    var done = this.async();

    setTimeout(function() {
      done(_.template(testUtil.templates[name]));
    }, 1);
  };

  // Set the collection full of items.
  var collection = new Backbone.Collection([
    { item: "Item 1" },
    { item: "Item 2" },
    { item: "Item 3" },
    { item: "Item 4" },
    { item: "Item 5" }
  ]);

  var View1 = Backbone.Layout.extend({
    template: "view1",
    fetchTemplate: fetchTemplate
  });

  var ListItem = Backbone.Layout.extend({
    template: "listItem",
    fetchTemplate: fetchTemplate,

    serialize: function() {
      return { item: this.model.get("item") };
    }
  });

  var View2 = Backbone.Layout.extend({
    template: "view2",
    fetchTemplate: fetchTemplate,

    beforeRender: function() {
      this.collection.each(function(model) {
        this.insertView(new ListItem({ model: model }));
      }, this);
    }
  });

  var View3 = Backbone.Layout.extend({
    template: "view3",
    fetchTemplate: fetchTemplate
  });

  var main = new Backbone.Layout({
    template: "view0",
    fetchTemplate: fetchTemplate
  });

  main.setView(".view0", new View1());

  //main.render().then(function() {
    main.insertViews({
      ".view1": [
        new View2({ collection: collection }),
        new View3()
      ]
    }).render().then(function() {
      equal(main.$(".listItem").length, 5, "Only five list items");
      start();
    });
  //});
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/160
test("remove method not working as expected", function() {
  var it;
  var Item = Backbone.Layout.extend({});

  var list = new Backbone.Layout({
    template: "<ul></ul>",
    fetchTemplate: function(path) { return _.template(path); },

    views: {
      "ul": [
        new Item(),
        (it = new Item()),
        new Item()
      ]
    }
  });

  list.render();

  equal(list.getViews().value().length, 3, "Length before remove is correct");

  // Remove the second sub view.
  it.remove();

  equal(list.getViews().value().length, 2, "Length after remove is correct");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/156
test("Shouldn't calling $('#app').html(new Backbone.Layout().render().el) work?", function() {
  ok(testUtil.isDomNode(new Backbone.Layout().render().el), "Is an element?");
});

// Async rendering.
// Great test for RAF - we expect the entire redundant render() call to be swallowed.
asyncTest("beforeRender and afterRender called thrice in async, useRAF: false", 3, function() {
  var hitAfter = 0;
  var hitBefore = 0;
  var renderNum = 0;

  var m = new Backbone.Model();

  var Item = Backbone.Layout.extend({
    useRAF: false,
    template: "lol",

    fetchTemplate: function(path) {
      var done = this.async();

      setTimeout(function() {
        done(_.template(path));
      }, Math.random()*5 + 1);
    },

    tagName: "tr",

    beforeRender: function() {
      hitBefore = hitBefore + 1;
    },

    afterRender: function() {
      hitAfter = hitAfter + 1;
    },

    renderTemplate: function(tmpl, data) {
      renderNum++;
      return tmpl(data);
    },

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    }
  });

  var List = Backbone.Layout.extend({
    useRAF: false,
    template: "<tbody></tbody>",

    fetchTemplate: function(path) {
      var done = this.async();

      setTimeout(function() {
        done(_.template(path));
      }, Math.random()*5 + 1);
    },

    initialize: function() {
      // Pass the model through.
      this.setView("tbody", new Item({ model: m }));
    }
  });

  var list = new List({ model: m });
  list.when([list.render(), list.render()]).then(function() {
    list.getView("tbody").once("afterRender", function() {

      equal(hitBefore, 3, "beforeRender hit three times");
      equal(hitAfter, 3, "afterRender hit three times");
      equal(renderNum, 3, "render called three times");

      start();
    });

    m.set("something", "changed");
  });
});

// Async rendering.
// Great test for RAF - we expect the entire redundant render() call to be swallowed.
asyncTest("beforeRender and afterRender called thrice in async, useRAF: true", 3, function() {
  var hitAfter = 0;
  var hitBefore = 0;
  var renderNum = 0;

  var m = new Backbone.Model();

  var Item = Backbone.Layout.extend({
    useRAF: true,
    template: "lol",

    fetchTemplate: function(path) {
      var done = this.async();

      setTimeout(function() {
        done(_.template(path));
      }, Math.random()*5 + 1);
    },

    tagName: "tr",

    beforeRender: function() {
      hitBefore = hitBefore + 1;
    },

    afterRender: function() {
      hitAfter = hitAfter + 1;
    },

    renderTemplate: function(tmpl, data) {
      renderNum++;
      return tmpl(data);
    },

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    }
  });

  var List = Backbone.Layout.extend({
    useRAF: true,
    template: "<tbody></tbody>",

    fetchTemplate: function(path) {
      var done = this.async();

      setTimeout(function() {
        done(_.template(path));
      }, Math.random()*5 + 1);
    },

    initialize: function() {
      // Pass the model through.
      this.setView("tbody", new Item({ model: m }));
    }
  });

  var list = new List({ model: m });
  list.when([list.render(), list.render()]).then(function() {
    list.getView("tbody").once("afterRender", function() {

      // Render should only be called *two* times here, as the 
      // first will be swallowed by RAF as it is redundant.
      equal(hitBefore, 2, "beforeRender hit two times");
      equal(hitAfter, 2, "afterRender hit two times");
      equal(renderNum, 2, "render called two times");

      start();
    });

    m.set("something", "changed");
  });
});

asyncTest("Array syntax for rendering a list", 2, function() {
  var Test = Backbone.Layout.extend({
    views: {
      "": [new this.SubView()]
    }
  });

  var test = new Test();

  test.render().then(function(){
    equal(test.views[""].length, 1, "Correct length");
    equal(testUtil.trim(test.$("div").text()), "Right", "Correct text");
    start();
  });

});

test("Remove a View from its parent", 1, function() {
  var Parent = Backbone.Layout.extend({
    views: {
      "lol": new this.SubView()
    }
  });

  var parent = new Parent();

  parent._removeViews(true);

  ok(!parent.views.lol, "View has been removed");
});

test("View attributes should be copied over to new View", 1, function() {
  var parent = new Backbone.Layout({
    views: {
      "hi": new Backbone.Layout({ id: "hi" })
    }
  });

  var view = parent.setView("hi", new Backbone.Layout({ id: "you" }));

  equal(view.$el.attr("id"), "you", "Correct id set.");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/178
asyncTest("view is not refreshed according to model.on", 2, function() {
  var beforeCount = 0;
  var afterCount = 0;

  var model = new Backbone.Model();

  var AutoView = Backbone.Layout.extend({
    beforeRender: function() {
      beforeCount++;
    },

    afterRender: function() {
      afterCount++;
    },

    initialize: function() {
      this.model.on("change", this.render, this);
    }
  });

  var autoView = new AutoView({ model: model });

  autoView.render().then(function(){
    autoView.once("afterRender", function(){
      equal(beforeCount, 2, "beforeRender was triggered");
      equal(afterCount, 2, "afterRender was triggered");
      start();
    });
    model.set("test", "this");
  });
});

test("cleanup is not called erroneously", 1, function() {
  var called = 0;
  var Child = Backbone.Layout.extend({
    cleanup: function() {
      called++;
    }
  });

  var Parent = Backbone.Layout.extend({
    initialize: function() {
      this.setView("", new Child());
    }
  });

  var parent = new Parent();
  parent.render();
  parent.render();

  ok(!called, "The cleanup method was never called");
});

test("cleanup called on View w/o parent when removed", 1, function() {
  var hit = false;
  var V = Backbone.Layout.extend({
    cleanup: function() {
      hit = true;
    }
  });

  var v = new V();

  v.remove();

  ok(hit, "Cleanup was successfully hit");
});

asyncTest("cleanup called on subview when parent view removed", function() {
  expect(2);
  var hitSub = false;
  var hitParent = false;

  var subview = new this.View({msg: "Right"});

  subview = _.extend(subview, {
    cleanup: function(){
      hitSub = true;
  }});


  var main = _.extend(new Backbone.Layout({
    template: "main",
    views: {
      ".right": subview
    }
  }), {cleanup: function() {hitParent = true;}});

  _.extend(main, {cleanup: function(){ hitParent=true;}});

  main.render().then(function() {
    main.remove();
    ok(hitSub, "Cleanup successfully called on a subview when parent removed");
    ok(hitParent, "Cleanup successfully called on parent view when removed");
    start();
  });
});

asyncTest("correctly remove inserted child views", function() {
  // parent view
  // child view via setView
  // chld views via insertViews
  //  render
  // insert new child view via insertViews
  // render
  // old child view is not removed correctly
 var ItemView = Backbone.Layout.extend({
    tagName: "tr",

    template: "<%= msg %>",

    fetchTemplate: function(name) {
      return _.template(name);
    },

    serialize: function() {
      return { msg: this.options.msg };
    }
  });

  var item1 = new ItemView({ msg: "1" });
  var item2 = new ItemView({ msg: "2" });
  var item3 = new ItemView({ msg: "3" });


  var list = new Backbone.Layout({
    template: "<tbody></tbody>",

    fetchTemplate: function(name) {
      return _.template(name);
    },

    beforeRender: function() {
      this.setView("subview", item1);
      this.insertView("tbody", item2);
      this.insertView("tbody", item3);
    }
  });

  list.render().then(function(){
    equal(list.getViews().value().length, 3, "Correct number of views.");
    list.insertView("tbody", item3);

    list.render().then(function(){
      equal(list.getViews().value().length, 3, "Correct number of views after reinsert.");

      list.render().then(function(){
        equal(list.getViews().value().length, 3, "Correct number of views after re-render.");
        start();
      });
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/200
test("getView should accept a selector name too", 3, function() {
  var view = new Backbone.Layout();

  var a = view.setView("a", new Backbone.Layout());
  var b = view.setView("b", new Backbone.Layout());
  view.insertView("c", new Backbone.Layout());
  view.insertView("c", new Backbone.Layout());

  equal(view.getView("a"), a, "Single getView returns single view");
  equal(view.getViews("b").value()[0], b, "Using getViews will return the single view in an array");
  equal(view.getViews("c").value().length, 2, "Two Views returned from getViews");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/302
test("getView should accept a `_.where` object too", 4, function() {
  var view = new Backbone.Layout();

  var model = new Backbone.Model();
  var model2 = new Backbone.Model();

  var a = view.setView("a", new Backbone.Layout({ model: model }));
  var b = view.setView("b", new Backbone.Layout({ id: 4 }));
  var d = view.setView("d", new Backbone.Layout({ model: model2 }));
  view.insertView("c", new Backbone.Layout({ model: model }));
  view.insertView("c", new Backbone.Layout({ id: 4 }));

  equal(view.getView({ model: model }), a, "Single getView returns single view");
  equal(view.getView({ model: model2 }), d, "Single getView returns single view");
  equal(view.getViews({ id: 4 }).first().value(), b, "Using getViews will return the single view in an array");
  equal(view.getViews({ id: 4 }).value().length, 2, "Two Views returned from getViews");
});

asyncTest("insertViews should accept a single array", 1, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  var listElems = [new Backbone.Layout({tagName: "li"}),
                   new Backbone.Layout({tagName: "li"})];

  var list = new Backbone.Layout({
    tagName: "ul",

    beforeRender: function() {
      this.insertViews(listElems);
    }
  });

  main.setView(".right", list);

  main.render().then(function() {
    var items = this.$(".right ul li");

    equal(items.length, 2, "Proper array insert");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/197
asyncTest("Allow async custom rendering of templates", 1, function() {
  var Test = Backbone.View.extend({
    manage: true,
    template: "Hello World!",
    fetchTemplate: _.identity,

    renderTemplate: function(template) {
      var done = this.async();

      setTimeout(function() {
        done(template);
      }, 1);
    }
  });

  var test = new Test();
  test.render().then(function() {
    equal(this.$el.html(), "Hello World!", "Contents match correctly");

    start();
  });
});

// To ensure the collection cleanup is hit correctly.
test("cleanup hit", 1, function() {
  var View = Backbone.View.extend({
    manage: true,

    renderTemplate: function() {
      ok(false);
    },

    initialize: function() {
      this.collection.on("reset", this.render, this);
    }
  });

  var collection = new Backbone.Collection();
  var view = new View({ collection: collection });
  view.remove();

  collection.trigger("reset");
  ok(true);
});

asyncTest("Duplicate sub-views are removed when their parent view is rendered repeatedly", 1, function() {
  var ListItemView = Backbone.Layout.extend({
    // Set a template source so Layout calls this view's `fetchTemplate` method
    // (the actual value is unimportant for this test)
    template: "#bogus",
    // Generic asynchronous `fetchTemplate` method
    fetchTemplate: function() {
      var done = this.async();
      setTimeout(function() {
        done(_.template(""));
      }, 0);
    }
  });

  var list = new Backbone.Layout({
    beforeRender: function() {
      this.insertView(new ListItemView());
    }
  });

  list.when([list.render(), list.render()]).done(function() {
    equal(list.views[""].length, 1, "All repeated sub-views have been removed");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/218
asyncTest("Scoping nested view assignment selector to parent", 1, function() {
  var layout = new Backbone.Layout({
    template: _.template("<div class='test'></div>"),
    fetchTemplate: _.identity,

    views: {
      ".test": new Backbone.Layout({
        afterRender: function() {
          this.$el.html("lol");
        }
      })
    }
  });

  layout.render().then(function(){
    equal(layout.$(".test div").html(), "lol", "Correct placeholder text");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/222
asyncTest("Different Orders of Rendering for a Re-Render", 2, function() {
  var msg = "";
  var parent = new Backbone.Layout();
  var child = new Backbone.Layout();

  // Append to msg;
  parent.on("afterRender", function() {
    msg += "a";
  });

  child.on("afterRender", function() {
    msg += "b";
  });

  parent.setView("test", child);

  parent.render().then(function(){
    equal(msg, "ab", "Initial correct ordering");
    parent.render().then(function(){
      equal(msg, "abab", "Even after re-render, maintains correct ordering");
      start();
    });
  });

});

asyncTest("Calling child.render() before parent.insertView() should still insert the rendered child.", 2, function() {
  var parent = new Backbone.Layout();
  // You need to set `keep: true` if you wish to reuse an appended item.
  var child = new Backbone.Layout({ keep: true });

  // Render both Views.
  parent.when([parent.render(), child.render()]).then(function(){
    // If you `insertView` this marks the View in the hierarchy, but does not
    // actually modify the DOM.
    parent.insertView(child);
    equal(parent.getView().tagName, "div", "Children inserted into parent");

    // When you call `render` this actually modifies the DOM structure to match
    // the virtual structure.
    parent.render().then(function(){
      equal(parent.$("div").length, 1, "Children inserted into parent");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/189
test("Allow layout to remove views", 2, function() {
  var view = new Backbone.View({ manage: true });
  var anotherView = new Backbone.View({ manage: true });

  view.setView("lol", anotherView);

  equal(view.getViews().value().length, 1, "Correct length");

  view.removeView("lol");

  equal(view.getViews().value().length, 0, "All nested views under lol removed");
});

//https://github.com/tbranyen/backbone.layoutmanager/issues/460
test("Test a cleanup event of views", 1, function() {
	  var view = new Backbone.View({ manage: true });
	  var cleanupEventCounter = 0;
	  
	  view.on("cleanup", function() { cleanupEventCounter++; });
	  view.remove();

	  equal(cleanupEventCounter, 1, "Cleanup event is fired.");
});

//https://github.com/tbranyen/backbone.layoutmanager/issues/453
test("Raise an event when all views in a given selector are closed", 3, function() {

  var eventCame = false;
  var foundSelector = "";
  
  var view = new Backbone.Layout({ manage: true });
  view.on("empty", function (selector) {
    eventCame = true; 
	foundSelector = selector;
  });
  
  var firstSubView = new Backbone.Layout({ manage: true });
  var secondSubView = new Backbone.Layout({ manage: true });

  view.insertView("lol", firstSubView);
  view.insertView("lol", secondSubView);

  firstSubView.remove();
  equal(eventCame, false, "Event not yet fired");

  secondSubView.remove();
  equal(eventCame, true, "Event got fired");
  equal(foundSelector, "lol", "Right selector was given to event");
});

//https://github.com/tbranyen/backbone.layoutmanager/issues/453
test("Raise an event when all views in a given selector are closed single view case", 2, function() {

  var eventCame = false;
  var foundSelector = "";
  
  var view = new Backbone.Layout({ manage: true });
  view.on("empty", function (selector) {
    eventCame = true;
	foundSelector = selector;
  });
  
  var firstSubView = new Backbone.Layout({ manage: true });
 
  view.setView("lol", firstSubView);
 
  firstSubView.remove();

  equal(eventCame, true, "Event got fired");
  equal(foundSelector, "lol", "Right selector was given to event");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/238
asyncTest("Lost triggered events in cached sub-view", 2, function() {
  
  // Sub view.
  var TestView = Backbone.Layout.extend({
    afterRender: function() {
      this.trigger("event");
    }
  });

  var test = new TestView();

  // There is a really weird bug that occurs when using stop(2) instead
  // of this workaround. Appears to be something deep inside QUnit, caused by running
  // a test more than once. If we use stop(2) instead and start() inside beforeRender below,
  // tests after this one will fail regularly.
  var endTest = _.after(2, start);

  // Main view.
  var MainView = Backbone.Layout.extend({
    beforeRender: function() {
      test.on("event", function() {
        ok(true);
        endTest();
      });

      // Render cached view.
      this.insertView(test);
    }
  });

  var view = new MainView();
  view.render().then(view.render);
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/243
asyncTest("afterRender callback will be triggered twice while beforeRender only once", 2, function() {
  var count = { before: 0, after: 0 };

  var View = Backbone.Layout.extend({
    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    },

    beforeRender: function() {
      count.before++;
    },

    afterRender: function() {
      count.after++;
    }
  });

  var view = new View({ model: new Backbone.Model() });
  view.render().then(function(){
    view.once("afterRender", function(){
      equal(count.before, 2, "beforeRender hit twice");
      equal(count.after, 2, "afterRender hit twice");
      start();
    });
    view.model.set("a", "b");
  });
});

asyncTest("manage your own view element", 1, function() {
  var layout = new Backbone.Layout({
    template: "list"
  });

  layout.insertView("ul", new Backbone.View({
    manage: true, el: false,

    template: "item",

    serialize: { text: "lol" }
  }));

  layout.render().then(function(){
    equal(layout.$el.html(), "<ul><li>lol</li></ul>", "Nested element is an LI");
    start();
  });
});

asyncTest("additional testing that view's without a parent can manage", 1, function() {
  var layout = new Backbone.Layout({
    el: false,

    template: "main",

    beforeRender: function() {
      for (var i = 0; i < 2; i++) {
        this.insertView(".right", new Backbone.View({
          manage: true,
          el: false,

          template: "view0"
        }));
      }
    }
  });

  layout.render().then(function(){
    equal(layout.$el.filter(".right").children(".view0").length, 2, "Correct length");
    start();
  });

});

asyncTest("Ordering sub-views with varying render delays", 1, function() {
  var Outside = Backbone.View.extend({
    manage: true,
    template: "[outside]",
    fetchTemplate: _.template
  });
  var Inside = Backbone.View.extend({
    manage: true,
    template: "[inside]",
    fetchTemplate: function(str) {
      var done = this.async();
      setTimeout(function() {
        done(_.template(str));
      }, 0);
    }
  });
  var Sandwich = Backbone.View.extend({
    manage: true,
    beforeRender: function() {
      this.insertView(new Outside());
      this.insertView(new Inside());
      this.insertView(new Outside());
    }
  });

  var sw = new Sandwich();
  sw.render().then(function() {
    equal(sw.$el.text(), "[outside][inside][outside]", "sub-view fetch delays do not affect ordering");
    start();
  });
});

asyncTest("Re-render confused when `el: false`", 1, function() {
  var View = Backbone.Layout.extend({
    el: false,

    template: _.template("<li>Test</li>")
  });

  var view = new View();

  var layout = new Backbone.Layout({
    template: _.template("<ul></ul>"),

    views: {
      ul: view
    }
  });

  layout.render();

  setTimeout(function() {
    view.render().then(function() {
      equal(layout.$("li").length, 1, "only one LI");
      start();
    });
  }, 1);
});

asyncTest("re-rendering a template works correctly", 1, function() {
  var View = Backbone.Layout.extend({
    template: _.template("<li><%= Math.random() %></li>")
  });

  var view = new View();

  var layout = new Backbone.Layout({
    template: _.template("<ul></ul>"),

    views: {
      ul: view
    }
  });

  layout.render().then(function(){
    var text = layout.getView("ul").$el.html();
    view.render().then(function() {
      var newText = layout.getView("ul").$el.html();

      notEqual(newText, text, "different contents");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/349
asyncTest("re-rendering a template with a blank result should remove old markup", 4, function() {
  var View = Backbone.Layout.extend({
    template: _.template("<%= content %>"),

    content: "",

    serialize: function() {
      return { content: this.content };
    }
  });

  var textView = new (View.extend({ content: "Hello" }))();
  var markupView = new (View.extend({ content: "<b>world</b>" }))();

  var layout = new Backbone.Layout({
    template: _.template("<div class='text'></div><div class='markup'></div>"),

    views: {
      ".text": textView,
      ".markup": markupView
    }
  });

  layout.render().then(function(){
    var text = layout.getView(".text").$el.html();
    var markup = layout.getView(".markup").$el.html();

    equal(text, "Hello", "initial text view render");
    equal(markup, "<b>world</b>", "initial markup view render");

    textView.content = "";
    markupView.content = "";

    layout.render().then(function() {
      var newText = layout.getView(".text").$el.html();
      var newMarkup = layout.getView(".markup").$el.html();

      equal(newText, "", "second text view render is empty");
      equal(newMarkup, "", "second markup view render is empty");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/271
asyncTest("`el: false` with deeply nested views", 1, function() {
  var Lvl2 = Backbone.Layout.extend({
    el: false,
    template: _.template("<div class='lvl2'>foo</div>")
  });
  var Lvl1 = Backbone.Layout.extend({
    el: false,
    template: _.template("<div class='lvl1'><div class='lvl2container'></div></div>")
  });
  var Lvl0 = Backbone.Layout.extend({
    el: false,
    template: _.template("<div class='lvl0'><div class='lvl1container'></div></div>")
  });

  var view = new Lvl0({
    views: {
      ".lvl1container": new Lvl1({
        views: {
          ".lvl2container": new Lvl2()
        }
      })
    }
  });

  var expected = [
    "<div class=\"lvl1container\">",
      "<div class=\"lvl1\">",
        "<div class=\"lvl2container\">",
          "<div class=\"lvl2\">foo</div>",
        "</div>",
      "</div>",
    "</div>"
  ];

  view.render().then(function(){
    equal(view.$el.html(), expected.join(""), "the same HTML");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/286
asyncTest("`el: false` with rerendering inserted child views doesn't replicate views", 1, function() {
  var app = _.extend({}, Backbone.Events);

  var Item = Backbone.Layout.extend({
    el: false,
    template:
      _.template("<div class='item'><span class='title <%= model.theClass %>'>Item <%= model.index %></span></div>"),
    initialize: function(options){
      this.model = options.model;
      this.listenTo(app, "event", this.addHighlight);
    },
    addHighlight: function(){
      this.model.set("theClass", "highlight");
      this.render();
    },
    serialize: function(){
      return {model: this.model.toJSON()};
    }
  });
  var List = Backbone.Layout.extend({
    template: _.template("<div class='listContainer'>List Container<div class='list'></div></div>"),
    initialize: function(){
      this.models = new Backbone.Collection([
        new Backbone.Model({index: 1}),
        new Backbone.Model({index: 2})
      ]);
    },
    beforeRender: function(){
      this.models.each(function(model){
        this.insertView(".list", new Item({
          model: model
        }));
      }, this);
    }
  });

  var expected = [
    "<div class=\"listContainer\">",
      "List Container",
      "<div class=\"list\">",
        "<div class=\"item\">",
          "<span class=\"title highlight\">Item 1</span>",
        "</div>",
        "<div class=\"item\">",
          "<span class=\"title highlight\">Item 2</span>",
        "</div>",
      "</div>",
    "</div>"
  ];

  var view = new List();

  view.render().then(function(){

    // Would be nice if we provided some shortcuts for this pattern
    var checkHTML = _.after(2, doCheck);
    view.getViews(".list").forEach(function(aView){
      aView.on("afterRender", checkHTML);
    }).value();
    function doCheck(){
      equal(view.$el.html(), expected.join(""), "the same HTML");
      start();
    }
    // Add highlight to elements to cause them to rerender. Should not replicate views.
    app.trigger("event");
  });
});

asyncTest("`el: false` with non-container element will not be duplicated", 2, function() {
  var expected = "<p>Paragraph 1</p><p>Paragraph 2</p>";
  var layout = new Backbone.Layout({
    template: _.template("<div class='layout'><div class='content'></div></div>")
  });
  var view = new Backbone.Layout({
    el: false,
    template: _.template(expected)
  });

  layout.setViews({
    ".content": view
  }).render().then(function() {
    equal(layout.$(".content").html(), expected);
    view.render().then(function() {
      equal(layout.$(".content").html(), expected);
      start();
    });
  });
});

asyncTest("trigger callback on a view with `keep: true`", 1, function() {
  var myView = new Backbone.Layout({
    keep: true,
    cleanup: function() {
      ok(true, "Cleanup triggered");
      start();
    }
  });

  var layout = new Backbone.Layout();
  layout.insertView(myView);

  // Render then cleanup.
  layout.render().then(function(){
    layout.removeView();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/323
asyncTest("template strings enclosed in whitespace should render without error", 1, function() {
  var layout = new Backbone.Layout({
    el: false,
    template: function() {
      return "\n <div>Hey</div>\n ";
    }
  });

  layout.render().then(function(){
    equal(testUtil.trim(layout.$el.text()), "Hey");
    start();
  });
});

asyncTest("<script> tags should not be removed from templates", 1, function() {
  var layout = new Backbone.Layout({
    el: false,
    template: function() {
      return "<div><script></script></div>";
    }
  });

  layout.render().then(function(){
    equal(layout.$el.find("script").length, 1);
    start();
  });

});

asyncTest("asynchronous beforeRender", 1, function() {
  var View = Backbone.Layout.extend({
    template: _.template("<div class='hello'></div>"),
    beforeRender: function() {
      var done = this.async();

      setTimeout(function() {
        done();
      }, 1);
    }
  });

  var view = new View();

  view.render().then(function() {
    ok(view.$(".hello").length, "Render works correctly");
    start();
  });
});

test("getViews returns an empty array for unrecognized selectors", function() {
  var layout = new Backbone.Layout();
  equal(layout.getViews(".whats-the-buzz").value().length, 0);
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/328
test("cleanViews invokes cleanup method in the context of the layout", function() {
  var layout = new Backbone.Layout({
    cleanup: function() {
      equal(this, layout);
    }
  });

  Backbone.Layout.cleanViews(layout);
});

asyncTest("Render views using named DOM section", 2, function() {
  var main = new Backbone.Layout({
    template: "main",
    sections: {
      "foo": ".right",
      "bar": ".left"
    },
    views: {
      "bar": new Backbone.Layout({
        afterRender: function() {
          this.$el.text("1");
        }
      })
    }
  });

  main.setView("foo", new Backbone.Layout({
    afterRender: function() {
      this.$el.text("2");
    }
  }));

  main.render().then(function() {

    equal(main.$(".left div").text(), "1", "Rendered in a section at initialization");
    equal(main.$(".right div").text(), "2", "Rendered in a section");

    start();
  });
});

test("Get views via named section and selector", 2, function() {
  var subView = new Backbone.Layout({
    afterRender: function() {
      this.$el.text("1");
    }
  });
  var main = new Backbone.Layout({
    template: "main",
    sections: {
      "foo": ".right"
    },
    views: {
      "foo": subView
    }
  });

  equal(main.getView("foo"), subView, "Get subview assigned to a section");
  equal(main.getView(".right"), subView, "Get subview assigned to a section");
});

test("Named DOM sections take precedence over selector", 2, function() {
  var subView = new Backbone.Layout({
    afterRender: function() {
      this.$el.text("1");
    }
  });
  var main = new Backbone.Layout({
    template: "main",
    sections: {
      ".left": ".right"
    },
    views: {
      ".left": subView
    }
  });

  main.getView(".right");

  equal(main.getView(".right"), subView, "subView placed in the right selector");
  equal(main.getView(".left"), subView, "Return view based on it's named section");

});

// Even though this was indirectly patched by @jugglinmike, this test will
// ensure future compatibility.
test("removeView fails if no subView exists.", 1, function() {
  var main = new Backbone.Layout();

  try {
    main.removeView(".test");
    ok(true, "Did not error");
  } catch (ex) {
    ok(false, "Errored");
  }
});

// Ensure non-function, non-string, values are passed to `fetchTemplate`.
asyncTest("object template", 1, function() {
  var testObject = { contents: "Here" };

  var View = Backbone.Layout.extend({
    template: testObject,

    fetchTemplate: function(template) {
      equal(template, testObject, "Correct object is passed");
    }
  });

  var view = new View();

  view.render().then(start);
});

asyncTest("passing filter function to `getViews`", 2, function() {
  var View = Backbone.Layout.extend({
    views: {
      "": [new Backbone.Layout(), new Backbone.Layout()]
    }
  });

  var view = new View();
  view.render().then(function(){
    view.getViews(function(view) {
      ok(view instanceof Backbone.Layout, "Is a Backbone View");
    }).value();
    start();
  });
});

asyncTest("renderViews will only render the children and not parent", 2, function() {
  var SubView = Backbone.Layout.extend({
    afterRender: function() {
      ok(true, "We want this to be hit");
    },

    template: "hello",

    fetchTemplate: function(template) {
      var done = this.async();

      // Simulate async.
      setTimeout(function() {
        done(_.template(template));
      }, 0);
    }
  });

  var BaseView = Backbone.Layout.extend({
    afterRender: function() {
      ok(false, "This should not be hit");
    },

    views: {
      "sub": new SubView()
    }
  });

  var baseView = new BaseView();

  // Lets ensure the promise implementation works too.
  baseView.renderViews().then(function() {
    equal(this.getView("sub").$el.text(), "hello", "correct render");
    start();
  });
});

asyncTest("renderViews will only render the provided array of children views and not parent or other child views", 2, function() {
  var SubView = Backbone.Layout.extend({
    afterRender: function() {
      ok(true, "We want this to be hit");
    },

    template: "hello",

    fetchTemplate: function(template) {
      var done = this.async();

      // Simulate async.
      setTimeout(function() {
        done(_.template(template));
      }, 0);
    }
  });

  var OtherSubView = Backbone.Layout.extend({
    afterRender: function() {
      ok(false, "This should not be hit");
    }
  });

  var BaseView = Backbone.Layout.extend({
    afterRender: function() {
      ok(false, "This should not be hit");
    },

    views: {
      "sub": new SubView(),
      "otherSub": new OtherSubView()
    }
  });

  var baseView = new BaseView();

  // Lets ensure the promise implementation works too.
  baseView.renderViews([baseView.getView("sub")]).then(function() {
    equal(this.getView("sub").$el.text(), "hello", "correct render");
    start();
  });
});

asyncTest("renderViews will only render the children views that match the selector and not parent or other child views", 2, function() {
  var SubView = Backbone.Layout.extend({
    afterRender: function() {
      ok(true, "We want this to be hit");
    },

    template: "hello",

    fetchTemplate: function(template) {
      var done = this.async();

      // Simulate async.
      setTimeout(function() {
        done(_.template(template));
      }, 0);
    }
  });

  var OtherSubView = Backbone.Layout.extend({
    afterRender: function() {
      ok(false, "This should not be hit");
    }
  });

  var BaseView = Backbone.Layout.extend({
    afterRender: function() {
      ok(false, "This should not be hit");
    },

    views: {
      "sub": new SubView(),
      "otherSub": new OtherSubView()
    }
  });

  var baseView = new BaseView();

  // Lets ensure the promise implementation works too.
  baseView.renderViews("sub").then(function() {
    equal(this.getView("sub").$el.text(), "hello", "correct render");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/pull/354#pullrequestreviewcomment-5362493
asyncTest("'insertView' uses user-defined `insert` method on parent", 2, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: _.template("<div class='test'>Hello</div>"),
    fetchTemplate: _.identity,
    insert: function($root, child){
      child = Backbone.$(child).prepend("<div>There</div>");
      $root.append(child);
      hit = true;
    }
  });

  layout.insertView(".test", new Backbone.Layout({
    template: _.template("<span>World</span>"),
    fetch: _.identity
  }));

  layout.render().then(function(){
    ok(hit, "Invoked user-defined `insert` method when rendering");
    equal(layout.$el.text(), "HelloThereWorld", "Used user-defined `insert` method to insert view HTML into layout");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/pull/354#pullrequestreviewcomment-5362493
asyncTest("'setView' uses user-defined `html` method on parent", 5, function() {
  var hit = 0, childHit = 0;
  var layout = new Backbone.Layout({
    template: _.template("<div class='test'>Hello</div>"),
    fetchTemplate: _.identity,
    html: function($root, content){
      content = Backbone.$(content).prepend("<b>Big</b>");
      $root.html(content);
      hit++;
    }
  });

  layout.render().then(function(){
    ok(hit == 1, "Invoked user-defined `html` method when rendering parent");
    equal(layout.$el.text(), "BigHello", "Used user-defined `html` method to insert view HTML into layout");

    layout.setView(".test", new Backbone.Layout({
      template: _.template("<span>World</span>"),
      fetchTemplate: _.identity,
      html: function($root, content){
        content = Backbone.$(content).prepend("<b>Huge</b>");
        $root.html(content);
        childHit++;
      }
    }));

    layout.render().then(function(){
      ok(hit == 3, "Invoked user-defined `html` method on parent when rendering parent & child (2 calls)");
      ok(childHit == 1, "Invoked user-defined `html` method on child when rendering child template");
      equal(layout.$el.text(), "BigHugeWorld", "Used user-defined `html` method to insert view HTML into layout");
      start();
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/366
asyncTest("A view's 'views' option should auto-invoke passed functions.", 3, function() {
  var setup = this;
  var listView = new Backbone.Layout({
    template: "list",
    views: {
      "ul": function() {
        return this.collection.map(function(model) {
          return new setup.ItemView({ model: model });
        });
      }
    },
    collection: [{ text: "one" }, { text: "two" }]
  });

  listView.render().then(function() {
    equal(this.$("ul li").length, 2, "Correct number of nested li's");
    equal(testUtil.trim( this.$("ul li").eq(0).html() ), "one",
      "Correct first li content");
    equal(testUtil.trim( this.$("ul li").eq(1).html() ), "two",
      "Correct second li content");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/383
test("A view will not throw an error when defined without an events hash", 1, function() {
  var TestView = Backbone.View.extend({
    manage: true
  });
  new TestView();
  ok(true, "Does not throw an exception");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/387
asyncTest("template strings with whitespace should render without error (trimmed whitespace)", 2, function() {
  var layout = new Backbone.Layout({
    el: false,
    template: function() {
      return "\n <div>Hey</div>\n ";
    },
    suppressWarnings: false
  });

  // Use `global.console` in node
  var console = (typeof window !== "undefined" && window.console) || global.console;

  // Override console.warn
  var oldConsoleWarn = console.warn;
  var warnCalled = false;
  console.warn = function() {
    warnCalled = true;
  };

  layout.render().then(function(){
    ok(!warnCalled,
      "'noel' didn't throw an error about multiple top level elements.");
    equal(testUtil.trim(layout.$el.text()), "Hey");
    console.warn = oldConsoleWarn;
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/417
test("Call setView to switch layout with nested views does not work", 1, function() {
  var Layout1 = Backbone.Layout.extend({
    template: function() { return "<div class='layout1'></div>"; },
    views: {
      ".layout1": new Backbone.Layout()
    }
  });

  new Layout1().render();

  var actual;

  try {
    new Layout1();
  } catch(ex) {
    actual = ex;
  }

  ok(!actual, "Should not throw an error.");
});

// Supplements 417 by providing a test for the intended use case.
test("not attached even if already rendered", 1, function() {
  var view = new Backbone.Layout({ className: "test" });
  view.render();

  var layout = new Backbone.Layout();
  layout.setView(view);

  ok(!view.contains(layout.el, view.el), "View should not exist inside Layout");
});

test("Modifications to options after initialization should not modify a view", 1, function() {
  var options = {
    option: "value"
  };
  var layout = new Backbone.Layout(options);
  options.option = "changedValue";
  equal(layout.options.option, "value");
});

asyncTest("template method context", 1, function() {
  var layout = new Backbone.Layout({
    template: function() {
      equal(this, layout);
      return "";
    }
  });

  layout.render().then(start);
});

test("removeView calls .value() in case the getViews() wrapper is executed lazily", function() {
  var child = new Backbone.Layout();
  var parent = new Backbone.Layout();

  parent.setView("child", child);

  var _ = this._;
  var origValue = _.prototype.value;
  var valueCalled = false;

  _.prototype.value = function() {
      origValue.call(this);
      valueCalled = true;
  };

  parent.removeView("child");

  _.prototype.value = origValue;

  ok(parent.getView("child") === undefined, "child view was removed");

  ok(valueCalled, ".value() was called");
});

test("_removeViews calls .value() in case the getViews() wrapper is executed lazily", function() {
  var child = new Backbone.Layout();
  var parent = new Backbone.Layout();

  parent.setView("child", child);

  var _ = this._;
  var origValue = _.prototype.value;
  var valueCalled = false;

  _.prototype.value = function() {
      origValue.call(this);
      valueCalled = true;
  };

  parent._removeViews(true);

  _.prototype.value = origValue;

  ok(parent.getView("child") === undefined, "child view was removed");

  ok(valueCalled, ".value() was called");
});

QUnit.module("setView");

test("Does not remove child's children", 1, function() {
  var Test = Backbone.Layout.extend({ template: "" });
  var parent = new Test();
  var child = new Test();
  var grandchild = new Test();

  child.setView(grandchild);
  parent.setView(child);
  parent.setView(child);

  ok(child.getView());
});

test("Cleans up previous child", 1, function() {
  var callCount = 0;
  var Test = Backbone.Layout.extend({ template: "" });
  var parent = new Test();
  var child = new Test({
    cleanup: function() {
      callCount++;
    }
  });
  var grandchild = new Test();
  var otherChild = new Test();

  child.setView(grandchild);
  parent.setView(child);
  parent.setView(otherChild);

  equal(callCount, 1);
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/445
asyncTest("Subviews should not be rendered asynchronously if removed from the parent view synchronously", 1, function() {
  var Child = Backbone.Layout.extend({
    className: "child"
  });

  var layout = new Backbone.Layout();
  layout.insertView(new Child()).render();
  layout.getView({className: "child"}).remove();
  layout.render().then(function(){
    equal(layout.$(".child").length, 0, "No children");
    start();
  });
});

asyncTest("Renders can be prevented in beforeRender with falsy return value", function() {
  var TestView = Backbone.Layout.extend({
    active: false,
    counter: 0,

    template: function() {
      return this.counter;
    },

    beforeRender: function() {
      this.counter++; 
      return !this.active;
    },

    afterRender: function() {
      this.active = true;
    }
  });

  var testView = new TestView();

  testView.render().then(function(){
    testView.render().then(function() {
      equal(testView.$el.text(), "1", "Has correct render value");
      start();
    });
  });
});

asyncTest("Renders can be prevented in beforeRender with a rejected Promise", function() {
  var TestView = Backbone.Layout.extend({
    active: false,
    counter: 0,

    template: function() {
      return this.counter;
    },

    beforeRender: function() {
      this.counter++; 
      var dfd = new Backbone.$.Deferred();

      if (!this.active) {
        dfd.resolve();
      }
      else {
        dfd.reject();
      }

      return dfd.promise();
    },

    afterRender: function() {
      this.active = true;
    }
  });

  var testView = new TestView();

  testView.render().then(function(){
    testView.render().then(function() {
      equal(testView.$el.text(), "1", "Has correct render value");
      start();
    });
  });
});

// No tests below here!
}
})();

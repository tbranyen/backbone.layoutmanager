(function() {
"use strict";

QUnit.module("views", {
  setup: function() {
    var setup = this;

    // Override the default template fetching behavior such that the tests can
    // run in the absense of the DOM (for Node.js). Store a reference to the
    // default `fetchTemplate` method to be restored in the teardown of this test
    // module.
    this.origFetch = Backbone.Layout.prototype.fetchTemplate;

    Backbone.Layout.configure({
      fetchTemplate: function(name) {
        return _.template(testUtil.templates[name]);
      },

      suppressWarnings: true
    });

    // Custom View
    this.View = Backbone.Layout.extend({
      template: "test",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;
      }
    });

    // Initialize View
    this.InitView = Backbone.Layout.extend({
      template: "test",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;

        this.setViews({
          ".inner-right": new setup.SubView()
        });
      }
    });

    this.SubView = Backbone.Layout.extend({
      template: "testSub",

      serialize: function() {
        return { text: "Right" };
      }
    });

    this.EventedListView = Backbone.Layout.extend({
      template: "list",

      initialize: function() {
        this.collection.on("reset", this.render, this);
      },

      cleanup: function() {
        this.collection.off(null, null, this);
      },

      beforeRender: function() {
        this.collection.each(function(model) {
          this.insertView("ul", new setup.ItemView({ model: model.toJSON() }));
        }, this);
      }
    });

    this.ListView = Backbone.Layout.extend({
      template: "list",

      beforeRender: function() {
        // Iterate over the passed collection and insert into the view
        _.each(this.collection, function(model) {
          this.insertView("ul", new setup.ItemView({ model: model }));
        }, this);
      }
    });

    this.ItemView = Backbone.Layout.extend({
      template: "testSub",
      tagName: "li",

      serialize: function() {
        return this.model;
      }
    });
  },

  teardown: function() {
    Backbone.Layout.configure({
      fetchTemplate: this.origFetch
    });

    // Remove `supressWarnings: true`.
    delete Backbone.Layout.prototype.suppressWarnings;
    delete Backbone.View.prototype.suppressWarnings;
  }
});

asyncTest("render outside defined partial", 2, function() {
  var main = new Backbone.Layout({
    template: "main"
  });

  main.setView(".right", new this.View({
    msg: "Right"
  }));

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  layout.render().promise().then(function() {
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

  main.render().promise().then(function() {

    trimmed = testUtil.trim( this.$(".inner-left").html() );
    equal(trimmed, "Right", "Correct re-render");

    main.setView(".right", new setup.View({
      msg: "Right Again"
    })).render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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

  main.render().promise().then(function() {
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
  right.render().promise().then(function() {
    count++;
  });

  // Level 2
  main.setView(".inner-right", new this.View({ msg: "2" })).render().promise().then(function() {
    count++;
  });

  // Level 3
  var innerRight = main.views[".inner-right"];

  innerRight.setViews({
    ".inner-right": [ new this.SubView(), new this.SubView() ]
  });

  innerRight.views[".inner-right"][0].render().promise().then(function() {
    count++;
  });

  innerRight.views[".inner-right"][1].render().promise().then(function() {
    count++;
  });

  main.render().promise().then(function() {
    equal(count, 4, "Render is only called once for each view");

    start();
  });
});

test("render callback and deferred context is view", 6, function() {
  // Since we have multiple start() calls, we use stop() with the 
  // number of start calls instead of using asyncTest
  stop(6);

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

  main.render().promise().then(function() {
    equal(this, main, "Layout render callback context is Layout");
    start();
  }).then(function() {
    equal(this, main, "Layout render deferred context is Layout");
    start();
  });

  main.views[".right"].render().promise().then(function() {
    equal(this, main.views[".right"], "View render callback context is View");
    start();
  }).then(function() {
    equal(this, main.views[".right"], "View render deferred context is View");
    start();
  });

  main.views[".left"][1].views[".inner-left"].render().promise().then(function() {
    equal(this, main.views[".left"][1].views[".inner-left"],
      "Nested View render callback context is View");
    start();
  }).then(function() {
    equal(this, main.views[".left"][1].views[".inner-left"],
      "Nested View render deferred context is View");
    start();
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

  main.render().promise().then(function() {
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

    view.render().promise().then(function() {
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

  main.render().promise().then(function() {
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
  main.render().promise().then(function() {
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

test("setView and insertView not working after model change", 1, function() {
  var setup = this;

  var m = new Backbone.Model();

  var View = Backbone.View.extend({
    manage: true,

    initialize: function() {
      this.model.on("change", function() {
        this.render();

        equal(layout.$(".inner-left").length, 2, "rendered twice");
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

  layout.render();

  m.set("some", "change");
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
test("render callback vs deferred resolve when called twice", 1, function() {
  // Create a new View.
  var view = new Backbone.View();

  // Set it up to work with Layout.
  Backbone.Layout.setupView(view);

  // Two renders using callback style.
  view.render().promise().then(function() {
    view.render().promise().then(function() {
      ok(true, "Two render's using callback style work.");
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

  view.render().on("afterRender", function() {
    equal(this.views[""].length, 2, "There should be two views");
    equal(this.views[""][0].options.order, 1, "The first order should be 1");
    equal(this.views[""][1].options.order, 2, "The second order should be 2");

    start();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/116
test("Re-rendering of inserted views causes append at the end of the list", 1, function() {
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

  main.render().promise().then(function() {
    list.views.tbody[0].render().promise().then(function() {
      var $tr = main.$("tbody").first().find("tr");

      equal($tr.html(), "hello", "Correct tbody order.");
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/122
test("afterRender() not called on item added with insertView()", 2, function() {
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

  list.render().promise().then(function() {
    m.set("something", "changed");
    equal(hitBefore, 2, "beforeRender hit twice");
    equal(hitAfter, 2, "afterRender hit twice");
  });
});

test("Render doesn't work inside insertView", 1, function() {
  var V = Backbone.Layout.extend({
    template: "<p class='inner'><%= lol %></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  var n = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  n.render();
  n.insertView("p", new V({ serialize: { lol: "hi" } })).render();

  equal(n.$("p.inner").html(), "hi", "Render works with insertView");
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
test("afterRender not firing", 1, function() {
  var hit = false;
  var l = new Backbone.Layout({
    template: "<p></p>",
    fetchTemplate: function(path) { return _.template(path); }
  });

  l.render();

  var V = Backbone.Layout.extend({
    template: "<span>hey</span>",
    fetchTemplate: function(path) { return _.template(path); },

    afterRender: function() {
      hit = true;
    }
  });

  l.setView("p", new V()).render();

  ok(hit, "afterRender was hit successfully");
});

test("multiple subclasses afterRender works", 1, function() {
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
      this.insertView("p", new ParentTest()).render();
    }
  });

  var test = new Test();
  test.render().promise().then(function() {
    test.triggerRender();

    equal(hit, 1, "Hit was correctly fired once");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/148
test("Views cannot be removed once added to a Layout", 3, function() {
  var v;

  var Child = Backbone.Layout.extend({
    className: "child"
  });

  var layout = new Backbone.Layout();
  v = layout.setView("", new Child());

  layout.render();
  equal(layout.$(".child").length, 1, "Only one child");

  v.remove();
  equal(layout.$(".child").length, 0, "No children");

  layout.render();
  equal(layout.$(".child").length, 0, "No children");
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

  //main.render().promise().then(function() {
    main.insertViews({
      ".view1": [
        new View2({ collection: collection }),
        new View3()
      ]
    }).render().promise().then(function() {
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
asyncTest("beforeRender and afterRender called twice in async", 3, function() {
  var hitAfter = 0;
  var hitBefore = 0;
  var renderNum = 0;

  var m = new Backbone.Model();

  var Item = Backbone.Layout.extend({
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
    list.getView("tbody").on("afterRender", function() {
      if (hitAfter === renderNum) {
        equal(hitBefore, 3, "beforeRender hit four times");
        equal(hitAfter, 3, "afterRender hit four times");
        equal(renderNum, 3, "render called four times");

        start();
      }
    });

    m.set("something", "changed");
  });
});

test("Array syntax for rendering a list", 2, function() {
  var Test = Backbone.Layout.extend({
    views: {
      "": [new this.SubView()]
    }
  });

  var test = new Test();

  test.render();

  equal(test.views[""].length, 1, "Correct length");
  equal(testUtil.trim(test.$("div").text()), "Right", "Correct text");
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
test("view is not refreshed according to model.on", 2, function() {
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

  autoView.render().promise().then(function() {
    model.set("test", "this");

    equal(beforeCount, 2, "beforeRender was triggered");
    equal(afterCount, 2, "afterRender was triggered");
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

  main.render().promise().then(function() {
    main.remove();
    ok(hitSub, "Cleanup successfully called on a subview when parent removed");
    ok(hitParent, "Cleanup successfully called on parent view when removed");
    start();
  });
});

test("attached even if already rendered", 1, function() {
  var view = new Backbone.Layout({ className: "test" });
  view.render();

  var layout = new Backbone.Layout();
  layout.setView(view).render();

  ok(view.contains(layout.el, view.el), "View exists inside Layout");
});

test("correctly remove inserted child views", function() {
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

  list.render();
  equal(list.getViews().value().length, 3, "Correct number of views.");

  list.insertView("tbody", item3);

  list.render();
  equal(list.getViews().value().length, 3, "Correct number of views after reinsert.");

  list.render();
  equal(list.getViews().value().length, 3, "Correct number of views after re-render.");

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

  main.render().promise().then(function() {
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
  test.render().promise().then(function() {
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
test("Scoping nested view assignment selector to parent", 1, function() {
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

  layout.render();

  equal(layout.$(".test div").html(), "lol", "Correct placeholder text");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/222
test("Different Orders of Rendering for a Re-Render", 2, function() {
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

  parent.render();
  equal(msg, "ab", "Initial correct ordering");

  parent.render();
  equal(msg, "abab", "Even after re-render, maintains correct ordering");
});

test("Calling child.render() before parent.insertView() should still insert the rendered child.", 2, function() {
  var parent = new Backbone.Layout();
  // You need to set `keep: true` if you wish to reuse an appended item.
  var child = new Backbone.Layout({ keep: true });

  // Render both Views.
  parent.render();
  child.render();

  // If you `insertView` this marks the View in the hierarchy, but does not
  // actually modify the DOM.
  parent.insertView(child);
  equal(parent.getView().tagName, "div", "Children inserted into parent");

  // When you call `render` this actually modifies the DOM structure to match
  // the virtual structure.
  parent.render();
  equal(parent.$("div").length, 1, "Children inserted into parent");
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

// https://github.com/tbranyen/backbone.layoutmanager/issues/238
test("Lost triggered events in cached sub-view", 2, function() {
  // Sub view.
  var TestView = Backbone.Layout.extend({
    afterRender: function() {
      this.trigger("event");
    }
  });

  var test = new TestView();

  // Main view.
  var MainView = Backbone.Layout.extend({
    beforeRender: function() {
      test.on("event", function() { ok(true); });

      // Render cached view.
      this.insertView(test);
    }
  });

  new MainView().render().render();
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/243
test("afterRender callback will be triggered twice while beforeRender only once", 2, function() {
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
  view.render();

  view.model.set("a", "b");

  equal(count.before, 2, "beforeRender hit twice");
  equal(count.after, 2, "afterRender hit twice");
});

test("manage your own view element", 1, function() {
  var layout = new Backbone.Layout({
    template: "list"
  });

  layout.insertView("ul", new Backbone.View({
    manage: true, el: false,

    template: "item",

    serialize: { text: "lol" }
  }));

  layout.render();
  equal(layout.$el.html(), "<ul><li>lol</li></ul>", "Nested element is an LI");
});

test("additional testing that view's without a parent can manage", 1, function() {
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

  layout.render();

  equal(layout.$el.filter(".right").children(".view0").length, 2, "Correct length");
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
  sw.render().promise().then(function() {
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
    view.render().promise().then(function() {
      equal(layout.$("li").length, 1, "only one LI");
      start();
    });
  }, 1);
});

test("re-rendering a template works correctly", 1, function() {
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

  layout.render();
  var text = layout.getView("ul").$el.html();

  view.render().promise().then(function() {
    var newText = layout.getView("ul").$el.html();

    notEqual(newText, text, "different contents");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/349
test("re-rendering a template with a blank result should remove old markup", 4, function() {
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

  layout.render();
  var text = layout.getView(".text").$el.html();
  var markup = layout.getView(".markup").$el.html();

  equal(text, "Hello", "initial text view render");
  equal(markup, "<b>world</b>", "initial markup view render");

  textView.content = "";
  markupView.content = "";

  layout.render().promise().done(function() {
    var newText = layout.getView(".text").$el.html();
    var newMarkup = layout.getView(".markup").$el.html();

    equal(newText, "", "second text view render is empty");
    equal(newMarkup, "", "second markup view render is empty");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/271
test("`el: false` with deeply nested views", 1, function() {
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

  view.render();

  var expected = [
    "<div class=\"lvl1container\">",
      "<div class=\"lvl1\">",
        "<div class=\"lvl2container\">",
          "<div class=\"lvl2\">foo</div>",
        "</div>",
      "</div>",
    "</div>"
  ];

  equal(view.$el.html(), expected.join(""), "the same HTML");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/286
test("`el: false` with rerendering inserted child views doesn't replicate views", 1, function() {
  var app = _.extend({}, Backbone.Events);

  var Item = Backbone.Layout.extend({
    el: false,
    template: _.template("<div class='item'><span class='title <%= model.theClass %>'>Item <%= model.index %></span></div>"),
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

  var view = new List();

  view.render();

  // Add highlight to elements to cause them to rerender. Should not replicate views.
  app.trigger("event");

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

  equal(view.$el.html(), expected.join(""), "the same HTML");
});

test("`el: false` with non-container element will not be duplicated", 2, function() {
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
  }).render().promise().done(function() {
    equal(layout.$(".content").html(), expected);
    view.render().promise().then(function() {
        equal(layout.$(".content").html(), expected);
    });
  });
});

test("trigger callback on a view with `keep: true`", 1, function() {
  var myView = new Backbone.Layout({
    keep: true, cleanup: function() { ok(true, "Cleanup triggered"); }
  });

  var layout = new Backbone.Layout();
  layout.insertView(myView);

  // Render.
  layout.render();

  // Cleanup.
  layout.removeView();
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/323
test("templates strings enclosed in whitespace should render without error", 1, function() {
  var layout = new Backbone.Layout({
    el: false,
    template: function() {
      return "\n <div>Hey</div>\n ";
    }
  });

  layout.render();

  equal(testUtil.trim(layout.$el.text()), "Hey");
});

test("<script> tags should not be removed from templates", 1, function() {
  var layout = new Backbone.Layout({
    el: false,
    template: function() {
      return "<div><script></script></div>";
    }
  });

  layout.render();

  equal(layout.$el.find("script").length, 1);
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

  view.render().promise().then(function() {
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

  main.render().promise().then(function() {

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
test("object template", 1, function() {
  var testObject = { contents: "Here" };

  var View = Backbone.Layout.extend({
    template: testObject,

    fetchTemplate: function(template) {
      equal(template, testObject, "Correct object is passed");
    }
  });

  var view = new View();

  view.render();
});

test("passing filter function to `getViews`", 2, function() {
  var View = Backbone.Layout.extend({
    views: {
      "": [new Backbone.Layout(), new Backbone.Layout()]
    }
  });

  var view = new View();
  view.render();

  view.getViews(function(view) {
    ok(view instanceof Backbone.Layout, "Is a Backbone View");
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
  baseView.renderViews().promise().then(function() {
    equal(this.getView("sub").$el.text(), "hello", "correct render");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/pull/354#pullrequestreviewcomment-5362493
test("'insertView' uses user-defined `insert` method on parent", 2, function() {
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

  layout.render();

  ok(hit, "Invoked user-defined `insert` method when rendering");
  equal(layout.$el.text(), "HelloThereWorld", "Used user-defined `insert` method to insert view HTML into layout");
});

// https://github.com/tbranyen/backbone.layoutmanager/pull/354#pullrequestreviewcomment-5362493
test("'setView' uses user-defined `html` method on parent", 5, function() {
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

  layout.render();
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

  layout.render();

  ok(hit == 3, "Invoked user-defined `html` method on parent when rendering parent & child (2 calls)");
  ok(childHit == 1, "Invoked user-defined `html` method on child when rendering child template");
  equal(layout.$el.text(), "BigHugeWorld", "Used user-defined `html` method to insert view HTML into layout");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/366
test("A view's 'views' option should auto-invoke passed functions.", 3, function() {
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

  listView.render().promise().then(function() {
    equal(this.$("ul li").length, 2, "Correct number of nested li's");
    equal(testUtil.trim( this.$("ul li").eq(0).html() ), "one",
      "Correct first li content");
    equal(testUtil.trim( this.$("ul li").eq(1).html() ), "two",
      "Correct second li content");
  });
});

})();

// https://github.com/tbranyen/backbone.layoutmanager/issues/383
test("A view will not throw an error when defined without an events hash", 1, function() {
  var TestView = Backbone.View.extend({
    manage: true
  });
  new TestView();
  ok(true, "Does not throw an exception");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/387
test("templates strings with whitespace should render without error (trimmed whitespace)", 2, function() {
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

  layout.render();

  ok(!warnCalled,
    "'noel' didn't throw an error about multiple top level elements.");
  equal(testUtil.trim(layout.$el.text()), "Hey");
  console.warn = oldConsoleWarn;
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

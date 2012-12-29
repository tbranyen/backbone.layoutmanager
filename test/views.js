function isNode(obj) {
  if (obj && obj.nodeType != null) {
    return true;
  }
}

module("views", {
  setup: function() {
    var setup = this;

    // Custom View
    this.View = Backbone.LayoutView.extend({
      template: "#test",

      data: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;
      }
    });

    // Initialize View
    this.InitView = Backbone.LayoutView.extend({
      template: "#test",

      data: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;

        this.setViews({
          ".inner-right": new setup.SubView()
        });
      }
    });

    this.SubView = Backbone.LayoutView.extend({
      template: "#test-sub",

      data: function() {
        return { text: "Right" };
      }
    });

    this.EventedListView = Backbone.LayoutView.extend({
      template: "#list",

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

    this.ListView = Backbone.LayoutView.extend({
      template: "#list",

      beforeRender: function() {
        // Iterate over the passed collection and insert into the view
        _.each(this.collection, function(model) {
          this.insertView("ul", new setup.ItemView({ model: model }));
        }, this);
      }
    });

    this.ItemView = Backbone.LayoutView.extend({
      template: "#test-sub",
      tagName: "li",

      data: function() {
        return this.model;
      }
    });
  }
});

asyncTest("render outside defined partial", 2, function() {
  var main = new Backbone.Layout({
    template: "#main"
  });

  var a = main.setView(".right", new this.View({
    msg: "Right"
  }));

  main.render().done(function() {
    var trimmed = $.trim( this.$(".inner-left").html() );
    
    ok(isNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("render inside defined partial", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "#main",

    views: {
      ".right": new this.View({ msg: "Right" })
    }
  });

  main.render().then(function() {
    var trimmed = $.trim( this.$(".inner-left").html() );

    ok(isNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("re-render a view defined after initialization", function(){
  expect(2);

  var trimmed;
  var setup = this;

  var main = new Backbone.Layout({
    template: "#main"
  });

  main.setView(".right", new this.View({ msg: "Right" }));

  main.render().then(function() {
    $('#container').html(this.el);

    trimmed = $.trim( $("#container .inner-left").html() );
    equal(trimmed, "Right", "Correct re-render");

    main.setView(".right", new setup.View({
      msg: "Right Again"
    })).render().then(function() {
      trimmed = $.trim( $("#container .inner-left").html() );
      equal(trimmed, "Right Again", "Correct re-render");

      start();
    });
  });
});

asyncTest("nested views", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "#main",

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
    var view = this;
    var trimmed = $.trim(this.$(".inner-right div").html());

    ok(isNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("data on Layout is a function", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "#test-sub",
    data: { text: "test text" }
  });

  main.render().then(function() {
    equal($.trim( $(this.el).text() ), testText, "correct data");

    start();
  });
});

asyncTest("data on Layout is an object", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "#test-sub",
    data: { text: "test text" }
  });

  main.render().then(function() {
    equal($.trim( $(this.el).text() ), testText, "correct data");

    start();
  });
});

// TODO THIS TEST
asyncTest("rendered event", function() {
  expect(4);

  var main = new Backbone.Layout({
    template: "#main",

    views: {
      ".right": new this.ListView({
        collection: [{ text: "one" }, { text: "two" }]
      })
    }
  });

  main.render().then(function() {
    ok(isNode(this.el), "Contents is a DOM Node");

    equal(this.$("ul li").length, 2, "Correct number of nested li's");
    equal($.trim( this.$("ul li:eq(0)").html() ), "one",
      "Correct first li content");

    equal($.trim( this.$("ul li:eq(1)").html() ), "two",
      "Correct second li content");

    start();
  });
});

asyncTest("insert views", function() {
  expect(4);

  var main = new Backbone.Layout({
    template: "#main",

    views: {
      ".right": new this.ListView({
        collection: [{ text: "one" }, { text: "two" }]
      })
    }
  });

  main.render().then(function() {
    ok(isNode(this.el), "Contents is a DOM Node");

    equal(this.$("ul li").length, 2, "Correct number of nested li's");

    equal($.trim( this.$("ul li:eq(0)").html() ), "one",
      "Correct first li content");

    equal($.trim( this.$("ul li:eq(1)").html() ), "two",
      "Correct second li content");

    start();
  });
});

asyncTest("using setViews", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "#main"
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
    var trimmed = $.trim(this.$(".inner-right div").html());

    ok(isNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("using setViews inside initialize", function() {
  expect(2);

  var main = new Backbone.Layout({
    template: "#main"
  });

  main.setViews({
    ".right": new this.InitView({
      msg: "Left"
    })
  });

  main.render().then(function() {
    var trimmed = $.trim( this.$(".inner-right div").html() );

    ok(isNode(this.el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("extend layoutmanager", 1, function() {
  var testText = "test text";

  var BaseLayout = Backbone.Layout.extend({
    template: "#test-sub",
    data: { text: "test text" }
  });

  var main = new BaseLayout();

  main.render().then(function() {
    equal($.trim( $(this.el).text() ), testText, "correct data");

    start();
  });
});

asyncTest("appending views with array literal", 3, function() {
  var main = new Backbone.Layout({
    template: "#main"
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

    equal($.trim(this.$(".right").children().eq(0).text() ), "One",
      "correct value set for the first child");

    equal($.trim(this.$(".right").children().eq(1).text() ), "Two",
      "correct value set for the second child");

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
    equal($.trim( this.$(".test").text() ), "Right",
      "Able to use an existing DOM element");
     
    start();
  });
});

asyncTest("single render per view", function() {
  expect(1);

  var count = 0;

  var main = new Backbone.Layout({
    template: "#main"
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

asyncTest("render callback and deferred context is view", function() {
  expect(6);

  var main = new Backbone.Layout({
    template: "#main",

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
    start();
  }).then(function() {
    equal(this, main, "Layout render deferred context is Layout");
    start();
  });

  main.views[".right"].render().then(function() {
    equal(this, main.views[".right"], "View render callback context is View");
    start();
  }).then(function() {
    equal(this, main.views[".right"], "View render deferred context is View");
    start();
  });

  main.views[".left"][1].views[".inner-left"].render().then(function() {
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
  var element;

  var main = new Backbone.Layout({
    template: "#main"
  });

  var view = main.setView(".right", new this.EventedListView({
    collection: new Backbone.Collection()
  }));

  view.collection.reset([ { text: 5 } ]);

  main.render().then(function() {
    view.collection.reset([ { text: 5 } ]);
  });

  view.collection.reset([ { text: 5 } ]);

  window.setTimeout(function() {
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

test("afterRender triggers for nested views", 1, function() {
  var triggered = false;
  var main = new Backbone.Layout({
    el: "#prefilled"
  });

  main.setViews({
    ".test": new this.SubView({
      data: { text: "Here" },

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
test("view render can be attached inside initalize", 1, function() {
  var main = new Backbone.Layout({
    template: "#main"
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
    template: "#main",

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
    template: "#main",

    views: {
      ".left": view
    }
  });

  layout.render();

  m.set("some", "change");
});

asyncTest("Ensure afterRender can access element's parent.", 1, function() {
  var view = new Backbone.LayoutView({
    template: "#main",

    views: {
      ".left": new Backbone.LayoutView({
        afterRender: function() {
          ok($.contains(view.el, this.el),
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

  // Set it up to work with LayoutManager.
  Backbone.LayoutManager.setupView(view);

  // Two renders using callback style.
  view.render().then(function() {
    view.render().then(function() {
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

    fetch: function(name) {
      var done = this.async();

      setTimeout(function() {
        done( _.template(name));
      }, Math.random()*100);
    }
  });

  var view = new View({
    views: {
      "": [ new View({ order: 1 }), new View({ order: 2 }) ]
    }
  });

  view.render().view.on("afterRender", function() {
    equal(this.views[""].length, 2, "There should be two views");
    equal(this.views[""][0].options.order, 1, "The first order should be 1");
    equal(this.views[""][1].options.order, 2, "The second order should be 2");

    start();
  });

});

// https://github.com/tbranyen/backbone.layoutmanager/issues/116
test("Re-rendering of inserted views causes append at the end of the list", 1, function() {
  var ItemView = Backbone.LayoutView.extend({
    tagName: "tr",

    template: "<%= msg %>",

    fetch: function(name) {
      return _.template(name);
    },

    data: function() {
      return { msg: this.options.msg };
    }
  });

  var item1 = new ItemView({ msg: "hello" });
  var item2 = new ItemView({ msg: "goodbye" });

  var list = new Backbone.LayoutView({
    template: "<tbody></tbody>",

    fetch: function(name) {
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
      equal(main.$("tbody:first tr").html(), "hello", "Correct tbody order.");
    });
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/118
test("events not correctly bound", 1, function() {
  var hit = false;

  var m = new Backbone.Model();

  var EventView = Backbone.LayoutView.extend({
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

  var Layout = Backbone.LayoutView.extend({
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

// https://github.com/tbranyen/backbone.layoutmanager/issues/122
test("afterRender() not called on item added with insertView()", 2, function() {
  var hitAfter = 0;
  var hitBefore = 0;

  var m = new Backbone.Model();

  var Item = Backbone.LayoutView.extend({
    template: "",

    fetch: function(path) {
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

  var List = Backbone.LayoutView.extend({
    template: "<tbody></tbody>",

    fetch: function(path) {
      return _.template(path);
    },

    beforeRender: function() {
      // Pass the model through.
      this.insertView("tbody", new Item({ model: m }));
    }
  });

  var list = new List({ model: m });

  list.render().then(function() {
    m.set("something", "changed");
    equal(hitBefore, 2, "beforeRender hit twice");
    equal(hitAfter, 2, "afterRender hit twice");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/126
test("render works when called late", 1, function() {
  var hit = false;
  var A = Backbone.Model.extend({});
  var ACollection = Backbone.Collection.extend({ model: A });
  var View = Backbone.LayoutView.extend({
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
  var View = Backbone.LayoutView.extend({
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

test("Render doesn't work inside insertView", 1, function() {
  var V = Backbone.LayoutView.extend({
    template: "<p class='inner'><%= lol %></p>",
    fetch: function(path) { return _.template(path); }
  });

  var n = new Backbone.LayoutView({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); }
  });

  n.render();
  n.insertView("p", new V({ data: { lol: "hi" } })).render();

  equal(n.$("p.inner").html(), "hi", "Render works with insertView");
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

// https://github.com/tbranyen/backbone.layoutmanager/issues/131
test("Ensure global paths are adhered to", 1, function() {
    Backbone.LayoutManager.configure({
      prefix: "test/"
    });

    var t = new Backbone.LayoutView({
      template: "here"
    });

    equal(t._options().prefix, "test/", "Prefix properly hooked up");

    Backbone.LayoutManager.configure({
      prefix: ""
    });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/137
test("afterRender not firing", 1, function() {
  var hit = false;
  var l = new Backbone.Layout({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); }
  });

  l.render();

  var V = Backbone.LayoutView.extend({
    template: "<span>hey</span>",
    fetch: function(path) { return _.template(path); },

    afterRender: function() {
      hit = true;
    }
  });

  l.setView("p", new V()).render();

  ok(hit, "afterRender was hit successfully");
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

  var V = Backbone.LayoutView.extend({
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

  var V = Backbone.LayoutView.extend({
    template: "<span>hey</span>",
    fetch: function(path) { return _.template(path); },

    events: {
      click: "hit"
    },

    hit: function(ev) {
      hit++;
    }
  });

  var S = Backbone.LayoutView.extend({
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

test("multiple subclasses afterRender works", 1, function() {
  var hit = 0;
  var SubClass1 = Backbone.LayoutView.extend({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    afterRender: function() {
      hit--;
    }
  });

  var SubClass2 = SubClass1.extend({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    afterRender: function lol() {
      hit++;
    }
  });

  var ParentTest = Backbone.LayoutView.extend({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    beforeRender: function() {
      this.setView("", new SubClass2());
    }
  });

  var Test = Backbone.LayoutView.extend({
    template: "<p></p>",
    fetch: function(path) { return _.template(path); },

    triggerRender: function() {
      this.insertView("p", new ParentTest()).render();
    }
  });

  var test = new Test();
  test.render().then(function() {
    test.triggerRender();

    equal(hit, 1, "Hit was correctly fired once");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/148
test("Views cannot be removed once added to a Layout", 3, function() {
  var v;

  var Child = Backbone.LayoutView.extend({
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
  // Simulating fetch, should only execute once per template and then cache.
  function fetch(path) {
    var done = this.async();
    
    window.setTimeout(function() {
      done(_.template($(path).html()));
    }, 500);            
  }

  // Set the collection full of items.
  var collection = new Backbone.Collection([ 
    { item: "Item 1" },
    { item: "Item 2" },
    { item: "Item 3" },
    { item: "Item 4" },
    { item: "Item 5" }
  ]);

  var View1 = Backbone.LayoutView.extend({
    template: "#view1",
    fetch: fetch
  });

  var ListItem = Backbone.LayoutView.extend({
    template: "#listItem",
    fetch: fetch,

    data: function() {
      return { item: this.model.get("item") };
    }
  });

  var View2 = Backbone.LayoutView.extend({
    template: "#view2",
    fetch: fetch,
      
    beforeRender: function() {
      this.collection.each(function(model) {
        this.insertView(new ListItem({ model: model }));
      }, this);
    }
  });

  var View3 = Backbone.LayoutView.extend({
    template: "#view3",
    fetch: fetch
  });

  var main = new Backbone.Layout({
    template: "#view0",
    fetch: fetch
  });

  main.setView(".view0", new View1());

  //main.render().done(function() {
    main.insertViews({
      ".view1": [
        new View2({ collection: collection }),
        new View3()
      ]
    }).render().done(function() {
      equal(main.$(".listItem").length, 5, "Only five list items");
      start();
    });
  //});
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/160
test("remove method not working as expected", function() {
  var it;
  var Item = Backbone.LayoutView.extend({});

  var list = new Backbone.LayoutView({
    template: "<ul></ul>",
    fetch: function(path) { return _.template(path); },

    views: {
      "ul": [
        new Item(),
        (it = new Item()),
        new Item()
      ]
    }
  });

  list.render();

  equals(list.getViews().value().length, 3, "Length before remove is correct");

  // Remove the second sub view.
  it.remove();

  equals(list.getViews().value().length, 2, "Length after remove is correct");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/156
test("Shouldn't calling $('#app').html(new BackboneLayout().render().el) work?", function() {

  ok(isNode(new Backbone.LayoutView().render().view.el), "Is an element?");

});

// Async rendering.
asyncTest("beforeRender and afterRender called twice in async", 3, function() {
  var hitAfter = 0;
  var hitBefore = 0;
  var renderNum = 0;

  var m = new Backbone.Model();

  var Item = Backbone.LayoutView.extend({
    template: "lol",

    fetch: function(path) {
      var done = this.async();

      window.setTimeout(function() {
        done(_.template(path));
      }, Math.random()*500 + 100);
    },

    tagName: "tr",

    beforeRender: function() {
      hitBefore = hitBefore + 1;
    },

    afterRender: function() {
      hitAfter = hitAfter + 1;
    },
    
    render: function(tmpl, data) {
      renderNum++;
      return tmpl(data);
    },

    initialize: function() {
      this.model.on("change", this.render, this);
    }
  });

  var List = Backbone.LayoutView.extend({
    template: "<tbody></tbody>",

    fetch: function(path) {
      var done = this.async();

      window.setTimeout(function() {
        done(_.template(path));
      }, Math.random()*500 + 100);
    },

    initialize: function() {
      // Pass the model through.
      this.setView("tbody", new Item({ model: m }));
    }
  });

  var list = new List({ model: m });

  list.views.tbody.on("afterRender", function() {
    if (hitAfter === renderNum) {
      equal(hitBefore, 3, "beforeRender hit four times");
      equal(hitAfter, 3, "afterRender hit four times");
      equal(renderNum, 3, "render called four times");
      m.off("setChange");

      start();
    }
  });

  $.when(list.render(), list.render()).then(function() {
    m.set("something", "changed");
  });
});

test("Array syntax for rendering a list", 2, function() {
  var Test = Backbone.LayoutView.extend({
    views: {
      "": [new this.SubView()]
    }
  });

  var test = new Test();

  test.render();

  equal(test.views[""].length, 1, "Correct length");
  equal($.trim(test.$("div").text()), "Right", "Correct text");
});

test("Remove a View from its parent", 1, function() {
  var Parent = Backbone.LayoutView.extend({
    views: {
      "lol": new this.SubView()
    }
  });

  var parent = new Parent();

  parent._removeViews(true);

  ok(!parent.views.lol, "View has been removed");
});

test("View attributes should be copied over to new View", 1, function() {
  var parent = new Backbone.LayoutView({
    views: {
      "hi": new Backbone.LayoutView({ id: "hi" })
    }
  });

  var view = parent.setView("hi", new Backbone.LayoutView({ id: "you" }));

  equal(view.$el.attr("id"), "you", "Correct id set.");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/178
test("view is not refreshed according to model.on", 2, function() {
  var beforeCount = 0;
  var afterCount = 0;

  var model = new Backbone.Model();

  var AutoView = Backbone.LayoutView.extend({
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

  autoView.render().then(function() {
    model.set("test", "this");

    equal(beforeCount, 2, "beforeRender was triggered");
    equal(afterCount, 2, "afterRender was triggered");
  });
});

test("cleanup is not called erroneously", 1, function() {
  var called = 0;
  var Child = Backbone.LayoutView.extend({
    cleanup: function() {
      called++;
    }
  });

  var Parent = Backbone.LayoutView.extend({
    initialize: function() {
      this.setView("", new Child());
    }
  });

  var parent = new Parent();
  parent.render();
  parent.render();

  ok(!called, "The cleanup method was never called");
});

asyncTest("afterRender inside Document", function() {
  var inDocument = false;

  var ProblemView = Backbone.LayoutView.extend({
    template: "not-real",

    fetch: function() {
      window.setTimeout(this.async(), 10);
    },

    afterRender: function() {
      inDocument = $.contains(this.el.parentNode.parentNode.parentNode, this.el);

      ok(inDocument, "element in is in the page Document");

      start();
    }
  });

  var NestedView = Backbone.LayoutView.extend({
    template: "not-real",

    fetch: function() {
      window.setTimeout(this.async(), 10);
    }
  });

  var NewView = Backbone.LayoutView.extend({
    template: "not-even-close-to-real",

    fetch: function() {
      window.setTimeout(this.async(), 200);
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

test("cleanup called on View w/o parent when removed", 1, function() {
  var hit = false;
  var V = Backbone.LayoutView.extend({
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
    template: "#main",
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

test("attached even if already rendered", 1, function() {
  var view = new Backbone.LayoutView({ className: "test" });
  view.render();

  var layout = new Backbone.Layout();
  layout.setView("", view);

  ok($.contains(layout.el, view.el), "View exists inside Layout");
});

test("correctly remove inserted child views", function() {
  // parent view
  // child view via setView
  // chld views via insertViews
  //  render
  // insert new child view via insertViews
  // render
  // old child view is not removed correctly
 var ItemView = Backbone.LayoutView.extend({
    tagName: "tr",

    template: "<%= msg %>",

    fetch: function(name) {
      return _.template(name);
    },

    data: function() {
      return { msg: this.options.msg };
    }
  });

  var item1 = new ItemView({ msg: "1" });
  var item2 = new ItemView({ msg: "2" });
  var item3 = new ItemView({ msg: "3" });


  var list = new Backbone.LayoutView({
    template: "<tbody></tbody>",

    fetch: function(name) {
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
  var view = new Backbone.LayoutView();

  var a = view.setView("a", new Backbone.LayoutView());
  var b = view.setView("b", new Backbone.LayoutView());
  view.insertView("c", new Backbone.LayoutView());
  view.insertView("c", new Backbone.LayoutView());

  equal(view.getView("a"), a, "Single getView returns single view");
  equal(view.getViews("b").value()[0], b, "Using getViews will return the single view in an array");
  equal(view.getViews("c").value().length, 2, "Two Views returned from getViews");
});

asyncTest("insertViews should accept a single array", 1, function() {
  var main = new Backbone.Layout({
    template: "#main"
  });

  var listElems = [new Backbone.LayoutView({tagName: "li"}),
                   new Backbone.LayoutView({tagName: "li"})];

  var list = new Backbone.LayoutView({
    tagName: "ul",

    beforeRender: function() {
      this.insertViews(listElems);
    }
  });

  main.setView('.right', list);

  main.render().done(function() {
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
    fetch: _.identity,

    render: function(template, data) {
      var done = this.async();

      window.setTimeout(function() {
        done(template);
      }, 100);
    }
  });

  var test = new Test();
  test.render().done(function() {
    equal(this.$el.html(), "Hello World!", "Contents match correctly");

    start();
  });
});

// To ensure the collection cleanup is hit correctly.
test("cleanup hit", 1, function() {
  var View = Backbone.View.extend({
    manage: true,

    render: function() {
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
  var ListItemView = Backbone.LayoutView.extend({
    // Set a template source so LayoutManager calls this view's `fetch` method
    // (the actual value is unimportant for this test)
    template: "#bogus",
    // Generic asynchronous `fetch` method
    fetch: function(name) {
      var done = this.async();
      setTimeout(function() {
        done(_.template(""));
      }, 0);
    }
  });

  var list = new Backbone.LayoutView({
    beforeRender: function() {
      this.insertView(new ListItemView());
    }
  });

  $.when(list.render(), list.render()).done(function() {
    equal(list.views[""].length, 1, "All repeated sub-views have been removed");
    start();
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/218
test("Scoping nested view assignment selector to parent", 1, function() {
  var layout = new Backbone.Layout({
    template: _.template("<div class='test'></div>"),
    fetch: _.identity,

    views: {
      ".test": new Backbone.LayoutView({
        afterRender: function() {
          this.$el.html("lol");
        }
      })
    }
  });

  layout.render();

  equal(layout.$(".test div").html(), "lol", "Correct placeholder text");
});

test("'insertView' uses user-defined `append` method", 2, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: _.template("<div class='test'>World</div>"),
    fetch: _.identity
  });

  layout.insertView(".test", new Backbone.LayoutView({
      template: _.template("Hello"),
      fetch: _.identity,
      append: function($root, child) {
        $root.before(child);
        hit = true;
      }
    }));

  layout.render();

  ok(hit, "Invoked user-defined `append` method when rendering");
  equal(layout.$el.text(), "HelloWorld", "Used user-defined `append` method to insert view HTML into layout");
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

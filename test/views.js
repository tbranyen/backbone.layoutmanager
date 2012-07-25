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

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;
      }
    });

    // Initialize View
    this.InitView = Backbone.LayoutView.extend({
      template: "#test",

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

    this.SubView = Backbone.LayoutView.extend({
      template: "#test-sub",

      serialize: function() {
        return { text: "Right" };
      }
    });

    this.EventedListView = Backbone.LayoutView.extend({
      template: "#list",

      initialize: function() {
        this.collection.bind("reset", function() {
          this.render();
        }, this);
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

      serialize: function() {
        return this.model;
      }
    });
  }
});

asyncTest("render outside defined partial", 2, function() {
  var main = new Backbone.Layout({
    template: "#main"
  });

  var a = main.setView(".right", new this.View({ msg: "Right" }));

  main.render().then(function() {
    var trimmed = $.trim( $(this.el).find(".inner-left").html() );

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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-left").html() );

    ok(isNode(el), "Contents is a DOM Node");
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

  main.render(function(el) {
    $('#container').html(el);

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

asyncTest("serialize on Layout is a function", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "#test-sub",
    serialize: { text: "test text" }
  });

  main.render(function(el) {
    equal($.trim( $(el).text() ), testText, "correct serialize");

    start();
  });
});

asyncTest("serialize on Layout is an object", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.Layout({
    template: "#test-sub",
    serialize: { text: "test text" }
  });

  main.render(function(el) {
    equal($.trim( $(el).text() ), testText, "correct serialize");

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

  main.render(function(el) {
    ok(isNode(el), "Contents is a DOM Node");

    equal($(el).find("ul li").length, 2, "Correct number of nested li's");
    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one",
      "Correct first li content");

    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two",
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

  main.render(function(el) {
    ok(isNode(el), "Contents is a DOM Node");

    equal($(el).find("ul li").length, 2, "Correct number of nested li's");

    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one",
      "Correct first li content");

    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two",
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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-right div").html() );

    ok(isNode(el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("extend layoutmanager", 1, function() {
  var testText = "test text";

  var BaseLayout = Backbone.Layout.extend({
    template: "#test-sub",
    serialize: { text: "test text" }
  });

  var main = new BaseLayout();

  main.render(function(el) {
    equal($.trim( $(el).text() ), testText, "correct serialize");

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

  main.render(function(el) {
    equal($(el).find(".right").children().length, 2, "correct children length");

    equal($.trim( $(el).find(".right").children().eq(0).text() ), "One",
      "correct value set for the first child");

    equal($.trim( $(el).find(".right").children().eq(1).text() ), "Two",
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

  main.render(function(el) {
    equal($.trim( $(el).find(".test").text() ), "Right",
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
  right.render(function() {
    count++;
  });

  // Level 2
  right.setView(".inner-right", new this.View({ msg: "2" })).render(function() {
    count++;
  });

  // Level 3
  var innerRight = right.views[".inner-right"];

  innerRight.setViews({
    ".inner-right": [ new this.SubView(), new this.SubView() ]
  });
  
  innerRight.views[".inner-right"][0].render(function() {
    count++;
  });

  innerRight.views[".inner-right"][1].render(function() {
    count++;
  });

  main.render(function(el) {
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

  main.render(function(el) {
    equal(this, main, "Layout render callback context is Layout");
    start();
  }).then(function(el) {
    equal(this, main, "Layout render deferred context is Layout");
    start();
  });

  main.views[".right"].render(function(el) {
    equal(this, main.views[".right"], "View render callback context is View");
    start();
  }).then(function(el) {
    equal(this, main.views[".right"], "View render deferred context is View");
    start();
  });

  main.views[".left"][1].views[".inner-left"].render(function(el) {
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
      equal(view.views["ul"].length, 4, "Only four views");
    });

    start();
  }, 5);
});

test("afterRender triggers for subViews", 1, function() {
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

  main.setView(".right", new TestRender({
    model: testModel
  }));

  testModel.trigger("change");

  main.render().then(function(el) {
    equal(this.$(".right").children().html(), "This works now!",
      "Content correctly set");

    start();
  });
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

test("setView and insertView not working after model change", function() {
  var setup = this;

  var m = new Backbone.Model();

  var View = Backbone.View.extend({
    manage: true,

    initialize: function() {
      this.model.on("change", function() {
        this.render();
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

  m.set("some", "change");

  layout.render().then(function(el) {
    equal(this.$(".inner-left").length, 2, "rendered twice");
  });
});

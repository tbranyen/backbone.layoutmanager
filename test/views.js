function isNode(obj) {
  if (obj && obj.nodeType != null) {
    return true;
  }
}

module("views", {
  setup: function() {
    var setup = this;

    // Custom View
    this.View = Backbone.View.extend({
      template: "#test",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;
      }
    });

    // Initialize View
    this.InitView = Backbone.View.extend({
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

    this.SubView = Backbone.LayoutManager.View.extend({
      template: "#test-sub",

      serialize: function() {
        return { text: "Right" };
      }
    });

    this.EventedListView = Backbone.View.extend({
      template: "#list",

      initialize: function() {
        this.collection.bind("reset", function() {
          this.render();
        }, this);
      },

      render: function(layout) {
        var view = layout(this);

        // Iterate over the passed collection and insert into the view
        this.collection.each(function(model) {
          view.insert("ul", new setup.ItemView({ model: model.toJSON() }));
        });

        return view.render();
      }
    });

    this.ListView = Backbone.View.extend({
      template: "#list",

      render: function(layout) {
        var view = layout(this);

        // Iterate over the passed collection and insert into the view
        _.each(this.collection, function(model) {
          view.insert("ul", new setup.ItemView({ model: model }));
        }, this);

        return view.render();
      }
    });

    this.ItemView = Backbone.LayoutManager.View.extend({
      template: "#test-sub",
      tagName: "li",

      serialize: function() {
        return this.model;
      }
    });
  }
});

asyncTest("render outside defined partial", function() {
  expect(2);

  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  var a = main.view(".right", new this.View({ msg: "Right" }));

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-left").html() );

    ok(isNode(el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("render inside defined partial", function() {
  expect(2);

  var main = new Backbone.LayoutManager({
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

  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  main.view(".right", new this.View({ msg: "Right" }));

  main.render(function(el) {
    $('#container').html(el);

    trimmed = $.trim( $("#container .inner-left").html() );
    equal(trimmed, "Right", "Correct re-render");

    main.view(".right", new setup.View({ msg: "Right Again" })).render().then(function() {
      trimmed = $.trim( $("#container .inner-left").html() );
      equal(trimmed, "Right Again", "Correct re-render");

      start();
    });
  });
});

asyncTest("nested views", function() {
  expect(2);

  var main = new Backbone.LayoutManager({
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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-right div").html() );

    ok(isNode(el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("serialize on LayoutManager is a function", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.LayoutManager({
    template: "#test-sub",
    serialize: { text: "test text" }
  });

  main.render(function(el) {
    equal($.trim( $(el).text() ), testText, "correct serialize");

    start();
  });
});

asyncTest("serialize on LayoutManager is an object", function() {
  expect(1);

  var testText = "test text";

  var main = new Backbone.LayoutManager({
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

  var main = new Backbone.LayoutManager({
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
    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one", "Correct first li content");
    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two", "Correct second li content");

    start();
  });
});

asyncTest("insert views", function() {
  expect(4);

  var main = new Backbone.LayoutManager({
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
    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one", "Correct first li content");
    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two", "Correct second li content");

    start();
  });
});

asyncTest("using setViews", function() {
  expect(2);

  var main = new Backbone.LayoutManager({
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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-right div").html() );

    ok(isNode(el), "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("using setViews inside initialize", function() {
  expect(2);

  var main = new Backbone.LayoutManager({
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

asyncTest("extend layoutmanager", function() {
  expect(1);

  var testText = "test text";

  var BaseLayout = Backbone.LayoutManager.extend({
    template: "#test-sub",
    serialize: { text: "test text" }
  });

  var main = new BaseLayout();

  main.render(function(el) {
    equal($.trim( $(el).text() ), testText, "correct serialize");

    start();
  });
});

asyncTest("appending views with array literal", function() {
  expect(3);

  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  main.setViews({
    ".right": [
      new this.View({
        msg: "One"
      }),

      new this.View({
        msg: "Two"
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

  var main = new Backbone.LayoutManager({
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

  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  var right = main.view(".right", new this.View({
    msg: "1"
  }));
  
  // Level 1
  right.render(function() {
    count++;
  });

  // Level 2
  right.view(".inner-right", new this.View({ msg: "2" })).render(function() {
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

  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View({ msg: "Right" }),
      ".left": [
        new this.View({ msg: "Left 1" }),
        new this.View({
            msg: "Left 2",
            views: {
              ".inner-left": new this.SubView({ lol: "hi" })
            }
        })
      ]
    }
  });

  main.render(function(el) {
    equal(this, main, "LayoutManager render callback context is LayoutManager");
    start();
  }).then(function(el) {
    equal(this, main, "LayoutManager render deferred context is LayoutManager");
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
    equal(this, main.views[".left"][1].views[".inner-left"], "Nested View render callback context is View");
    start();
  }).then(function(el) {
    equal(this, main.views[".left"][1].views[".inner-left"], "Nested View  render deferred context is View");
    start();
  });
});

asyncTest("list items don't duplicate", function() {
  var element;

  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  var view = main.view(".right", new this.EventedListView({
    collection: new Backbone.Collection()
  }));

  view.collection.reset([ { text: 5 } ]);

  main.render(function(el) {
    view.collection.reset([ { text: 5 } ]);
    element = el;
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
      equal(view.$("ul").children().length, 4,
        "Only four elements");
    });

    start();
  }, 5);
});

test("view render fn then()", function() { //  expect(1); // //  var triggered = false;

  var triggered = false;

  var main = new Backbone.LayoutManager({
    el: "#prefilled"
  });

  main.setViews({
    ".test": new this.SubView({
      options: {
        render: function(manage) {
          window.duh = manage(this).render();
          return duh.then(function() {
            triggered = true;
          });
        }
      }
    })
  });

  main.render(function(el) {
    ok(triggered == true, "Promise still exists on custom render");
     
    start();
  });
});

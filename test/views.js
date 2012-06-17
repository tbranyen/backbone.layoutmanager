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

    this.SubView = Backbone.View.extend({
      template: "#test-sub",

      serialize: function() {
        return { text: "Right" };
      }
    });

    this.EventedListView = Backbone.View.extend({
      template: "#list",

      initialize: function() {
        this.options.fetch = function(path) {
          var done = this.async();

          window.setTimeout(function() {
            done(_.template($(path).html()));
          }, 15000);
        };

        this.collection.bind("reset", function() {
          this.render();
        }, this);
      },

      render: function(manage) {
        // Iterate over the passed collection and insert into the view
        this.collection.each(function(model) {
          this.insertView("ul", new setup.ItemView({ model: model.toJSON() }));
        }, this);

        return manage(this).render();
      }

    });

    this.ListView = Backbone.View.extend({
      template: "#list",

      render: function(manage) {
        // Iterate over the passed collection and insert into the view
        _.each(this.collection, function(model) {
          this.insertView("ul", new setup.ItemView({ model: model }));
        }, this);

        return manage(this).render();
      }
    });

    this.ItemView = Backbone.View.extend({
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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-left").html() );

    ok(isNode(el), "Contents is a DOM Node");
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

    main.setView(".right", new setup.View({ msg: "Right Again" })).render().then(function() {
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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-right div").html() );

    ok(isNode(el), "Contents is a DOM Node");
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
    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one", "Correct first li content");
    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two", "Correct second li content");

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
    equal($.trim( $(el).find("ul li:eq(0)").html() ), "one", "Correct first li content");
    equal($.trim( $(el).find("ul li:eq(1)").html() ), "two", "Correct second li content");

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

  main.render(function(el) {
    var trimmed = $.trim( $(el).find(".inner-right div").html() );

    ok(isNode(el), "Contents is a DOM Node");
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
    equal(this, main.views[".left"][1].views[".inner-left"], "Nested View render callback context is View");
    start();
  }).then(function(el) {
    equal(this, main.views[".left"][1].views[".inner-left"], "Nested View  render deferred context is View");
    start();
  });
});

asyncTest("list items don't duplicate", function() {
  var element;

  var main = new Backbone.Layout({
    template: "#main"
  });

  var view = main.setView(".right", new this.EventedListView({
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
      equal(view.$("ul").children().length, 4, "Only four elements");
    });

    start();
  }, 5);
});

test("view render fn then()", 1, function() {
  var triggered = false;
  var main = new Backbone.Layout({
    el: "#prefilled"
  });

  main.setViews({
    ".test": new this.SubView({
      render: function(manage) {
        return manage(this).render({ text: "Here" }).then(function() {
          triggered = true;
        });
      }
    })
  });

  main.render(function(el) {
    ok(triggered == true, "Promise still exists on custom render");
     
    start();
  });
});

// Do this one without a custom render function as well.
test("view render can be attached inside initalize", 1, function() {
  var main = new Backbone.Layout({
    template: "#main"
  });

  var TestRender = Backbone.View.extend({
    initialize: function() {
      this.model.on("change", this.render, this);
    },

    render: function(manage) {
      this.$el.html("This works now!");

      return manage(this).render();
    }
  });

  var testModel = new Backbone.Model();

  main.setView(".right", new TestRender({
    model: testModel
  }));

  testModel.trigger("change");

  main.render().then(function(el) {
    equal(this.$(".right").children().html(), "This works now!", "Content correctly set");

    start();
  });
});

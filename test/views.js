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

    this.SubView = Backbone.LayoutManager.View.extend({
      template: "#test-sub",

      serialize: function() {
        return { text: "Right" };
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

asyncTest("insert views", function() {
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

asyncTest("extend layoutmanager", function() {
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

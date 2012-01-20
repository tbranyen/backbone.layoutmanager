module("views", {
  setup: function() {
    var setup = this;

    // Custom View
    this.View = Backbone.LayoutManager.View.extend({
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

  main.views[".right"] = new this.View({ msg: "Right" });

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-left").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
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

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-left").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("nested views", function() {
  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View({
        msg: "Left",

        views: {
          ".inner-right": new this.SubView()
        }
      })
    }
  });

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

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

  main.render(function(contents) {
    ok(contents instanceof Element, "Contents is a DOM Node");

    equal($(contents).find("ul li").length, 2, "Correct number of nested li's");
    equal($.trim( $(contents).find("ul li:eq(0)").html() ), "one", "Correct first li content");
    equal($.trim( $(contents).find("ul li:eq(1)").html() ), "two", "Correct second li content");

    start();
  });
});

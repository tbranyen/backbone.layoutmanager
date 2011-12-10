module("views", {
  setup: function() {
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

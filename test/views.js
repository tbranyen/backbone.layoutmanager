module("views", {
  setup: function() {
    // Custom View
    this.View = Backbone.LayoutManager.View.extend({
      template: "#test",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(msg) {
        this.msg = msg;
      }
    });
  }
});

asyncTest("render outside defined partial", function() {
  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  main.views[".right"] = new this.View("Right");

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("render inside defined partial", function() {
  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View("Right")
    }
  });

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

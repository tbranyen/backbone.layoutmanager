module("views", {
  setup: function() {
    // Custom View
    this.View = Backbone.View.extend({
      template: "#test",

      render: function(layout) {
        return layout(this).render({ text: this.msg });
      },

      initialize: function(msg) {
        this.msg = msg;
      }
    });
  }
});

asyncTest("render one partial", function() {
  var main = new Backbone.LayoutManager({
    name: "#main"
  });

  main.views[".right"] = new this.View("Right");

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");
    start();
  });
});

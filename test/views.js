module("views", {
  setup: function() {
    // Set up LayoutManager to be DOM
    Backbone.LayoutManager.configure({
      fetch: function(path) {
        return $(path).html();
      }
    });

    // Custom View
    this.View = Backbone.View.extend({
      template: "#test",

      render: function(layout) {
        return layout(this).render({ text: "Right" });
      },

      initialize: function(msg) {
        
      }
    });
  }
});

asyncTest("render one partial", function() {
  var main = new Backbone.LayoutManager({
    name: "#main"
  });

  main.partials[".right"] = new this.View();

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");
    start();
  });
});

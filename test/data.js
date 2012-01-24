module("data", {
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

  var right = main.view(".right", new this.View({ msg: "Right" }));

  main.render(function(el) {
    equal($(el).data("view"), main, "View set correctly on layout");
    equal($(el).find(".right div").data("view"), right, "View set correctly on template");

    start();
  });
});

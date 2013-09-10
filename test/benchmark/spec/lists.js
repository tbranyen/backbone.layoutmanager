/*global Benchmark, Backbone, ui, document, _, $ */

/**
 * Backbone.LayoutManager list rendering tests
 */

(function(){

  /**
   * Suite methods
   */
  // function log(text) {
  //   $("#results").append("<li>" + text + "</li>");
  // }

  // Setup & teardown  
  Benchmark.prototype.setup = function(){

    window.ListView = Backbone.Layout.extend({
      el: "#testArea",
      template: _.template("<div class=\"inner\"></div>"),
      initialize: function(options) {
        for (var i = 0; i < options.innerViews; i++){
          this.insertView(".inner", new window.ItemView({
            model: new Backbone.Model({
              prop1: Math.random() * 1000000,
              prop2: Math.random() * 1000000
            })
          }));
        }
      }
    });

    window.ItemView = Backbone.Layout.extend({
      template: _.template("<div><h1><%= prop1 %></h1><%= prop2 %></div>"),
      serialize: function(){
        return this.model.toJSON();
      }
    });

    // Create attached testArea
    $("body").append($("<div id=\"testArea\"></div>"));
  };

  Benchmark.prototype.teardown = function(){
    // Remove rendered elements.
    $("#testArea").remove();
  };

  // Add Benchmarks
  ui.add({
    name: "Create ListView with 1000 children",
    defer: true,
    // Benchmark Body (timed section)
    fn: function(test) {
      var list = new window.ListView({innerViews: 1000});
      list.on("afterRender", test.resolve, test);
      list.render();
    }
  })
  .add({
    name: "Create ListView with 1000 children (detached)",
    defer: true,
    // Benchmark Body
    fn: function(test) {
      var list = new window.ListView({innerViews: 1000});
      list.setElement($("<div>"));
      list.on("afterRender", test.resolve, test);
      list.render();
    }
  })
  .add({
    name: "Create ListView with 10 children",
    defer: true,
    // Benchmark Body (timed section)
    fn: function(test) {
      var list = new window.ListView({innerViews: 10});
      list.on("afterRender", test.resolve, test);
      list.render();
    }
  })
  .add({
    name: "Create ListView with 10 children (detached)",
    defer: true,
    // Benchmark Body
    fn: function(test) {
      var list = new window.ListView({innerViews: 10});
      list.setElement($("<div>"));
      list.on("afterRender", test.resolve, test);
      list.render();
    }
  });
})();
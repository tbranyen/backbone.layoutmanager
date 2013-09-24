/*global Benchmark, Backbone, ui, _, $ */

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

    var tpl = "<div><h1><%= prop1 %></h1><%= prop2 %></div>";

    window.ListView = Backbone.Layout.extend({
      el: "#testArea",
      template: _.template("<div class=\"inner\"></div>"),
      initialize: function(options) {
        var ItemView = options.noel ? window.ItemViewNoEl : window.ItemView;
        for (var i = 0; i < options.innerViews; i++){
          this.insertView(".inner", new ItemView({
            model: new Backbone.Model({
              prop1: Math.random() * 1000000,
              prop2: Math.random() * 1000000
            })
          }));
        }
      }
    });

    window.ItemView = Backbone.Layout.extend({
      template: _.template(tpl),
      serialize: function(){
        return this.model.toJSON();
      }
    });

    window.ItemViewNoEl = window.ItemView.extend({
      el: false
    });

    window.FakeListView = Backbone.Layout.extend({
      el: "#testArea",
      initialize: function(options) {
        this.template = _.template(options.tpl);
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
  // Examples:
  // 
  // Async:
  // ui.add({
  //   name: "Async Test",
  //   defer: true,
  //   fn: function(test) {
  //     var list = new window.ListView({innerViews: 1000});
  //     list.on("afterRender", function(){
  //       // Call test.resolve() to end the test, binding is important
  //       somethingAsync(test.resolve.bind(test));
  //     });
  //     list.render();
  //   }
  // })
  // 
  // Sync:
  // ui.add({
  //   name: "Sync test",
  //   fn: function() {
  //     var list = new window.ListView({innerViews: 1000});
  //     list.render();
  //   }
  // })
 
  ui.add({
    name: "Create ListView with 1000 children",
    // Benchmark Body (timed section)
    fn: function() {
      var list = new window.ListView({innerViews: 1000});
      list.render();
    }
  })
  .add({
    name: "Create ListView with 1000 children (detached)",
    fn: function() {
      var list = new window.ListView({innerViews: 1000});
      list.setElement($("<div>"));
      list.render();
    }
  })
  .add({
    name: "Create ListView with 10 children",
    fn: function() {
      var list = new window.ListView({innerViews: 10});
      list.render();
    }
  })
  .add({
    name: "Create ListView with 10 children (detached)",
    fn: function() {
      var list = new window.ListView({innerViews: 10});
      list.setElement($("<div>"));
      list.render();
    }
  })
  .add({
    name: "Create ListView with 10 children (noel)",
    fn: function() {
      var list = new window.ListView({innerViews: 10, noel: true});
      list.render();
    }
  })
  .add({
    name: "Fake list view with 1000 children (testing batch html parsing)",
    setup: function() {
      var tpl = "<div><h1><%= prop1 %></h1><%= prop2 %></div>";
      var longTpl = "";
      for (var i = 0; i < 1000; i++) {
        longTpl += tpl;
      }
      window.FakeListView = window.ListView.extend({
        template: _.template(longTpl)
      });
    },
    fn: function() {
      var list = new window.FakeListView();
      list.render();
    }
  });
})();
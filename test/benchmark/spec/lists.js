/*global Benchmark, Backbone, _, ui, document */

/**
 * Backbone.LayoutManager list rendering tests
 */

(function(){

  /**
   * Suite methods
   */
  function log(text) {
    $('#results').append('<li>' + text + '</li>');
  }

  // Setup & teardown  
  Benchmark.prototype.setup = function(){
    var collection = new Backbone.Collection();
    for (var i = 0; i < 1000; i++) {
      collection.add(new Backbone.Model({
        prop1: Math.random() * 1000000,
        prop2: Math.random() * 1000000
      }));
    }

    var ListView = Backbone.Layout.extend({
      el: "#testArea",
      template: '<div class="inner"></div>',
      beforeRender: function(){
        this.collection.each(function(model){
          this.insertView('.inner', new ItemView({
            model: model
          }));
        });
      }
    });

    var ItemView = Backbone.Layout.extend({
      template: generateTemplate(),
      serialize: function(){
        return this.model.toJSON();
      }
    });

    // Generate a long template so it takes a while to render
    function generateTemplate(){
      var tpl = ['<div>'];
      for (var i = 0; i < 100; i++) {
        tpl.push('<div><h1><%= prop1 %></h1><%= prop2 %></div>');
      }
      tpl.push('</div>');
      return tpl.join('');
    }

    // Binding
    this.collection = collection;
    this.ListView = ListView;
    this.ItemView = ItemView;

    // Create el for ListView to attach to.
    var testArea = document.createElement('div');
    testArea.id = 'testArea';
    document.body.appendChild(testArea);
  };

  Benchmark.prototype.teardown = function(){
    // Remove rendered elements.
    var testArea = document.getElementById('testArea');
    document.body.removeChild(testArea);
  };

  // Add Benchmarks
  ui.add({
    name: 'Create ListView with 1000 children',
    defer: true,
    // Benchmark Body (timed section)
    fn: function(test) {
      var list = new test.ListView({ collection: test.collection });
      list.on('afterRender', test.resolve, test);
      list.render();
    }
  });
})();
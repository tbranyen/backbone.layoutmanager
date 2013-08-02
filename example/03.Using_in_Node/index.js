// If you installed LayoutManager globally, you would do:
// var LayoutManager = require("backbone.layoutmanager");

// Since we want this to run without having to install LayoutManager...
var LayoutManager = require("../../node");

// Create a header View and notice that simply providing a path to a template
// will automatically load it.
var Header = Backbone.Layout.extend({
  template: "header"
});

var layout = new Backbone.Layout({
  template: "test",

  views: {
    "header": new Header({ el: false })
  }
});

// Render the layout and echo out the contents.
layout.render().promise().then(function() {
  // Should echo out: <header><h1>This is my header!</h1></header>
  console.log(this.$el.html());
});

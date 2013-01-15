// If you install via NPM per the best practices, you would do:
// var LayoutManager = require("backbone.layoutmanager");

// Since we want this to run without having to install LayoutManager...
var LayoutManager = require("../../node");

// Setting this option augments `Backbone.View` to work like `Layout`.
LayoutManager.configure({ manage: true });

// Create a header View and notice that simply providing a path to a template
// will automatically load it.
var Header = Backbone.View.extend({
  template: "header.html"
});

var layout = new Backbone.Layout({
  template: "test.html",

  views: {
    "header": new Header({ el: false })
  }
});

// Render the layout and echo out the contents.
layout.render().then(function() {
  // Should echo out: <header><h1>This is my header!</h1></header>
  console.log(this.$el.html());
});

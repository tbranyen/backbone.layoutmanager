var Backbone = require("backbone");
var Layout = require("../../node");

var Header = Backbone.View.extend({
  template: "header.html"
});

var layout = new Backbone.Layout({
  template: "test.html",

  views: {
    "header": new Header()
  }
});

layout.render().then(function(el) {
  console.log(this.$el.html());
});

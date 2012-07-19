var Backbone = require("backbone");
var Layout = require("backbone.layoutmanager");

var Header = Backbone.View.extend({
  template: "header.html"
});

var layout = new Backbone.Layout({
  template: "test.html",

  views: {
    "header": [new Header(),new Header(),new Header()]
  }
});

layout.render().then(function(el) {
  console.log(this.$el.html());
});

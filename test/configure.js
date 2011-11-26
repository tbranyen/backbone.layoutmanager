module("configure", {
  setup: function() {
    this.options = Backbone.LayoutManager.prototype.options;
  },
  teardown: function() {
    this.options.paths = {};
  }
});

test("defaults", function() {
  deepEqual(this.options.paths, {}, "No paths");
});

test("invalid", function() {
  Backbone.LayoutManager.configure("key", "val");

  equals(this.options.key, undefined, "Invalid assignment");
});

test("global", function() {
  Backbone.LayoutManager.configure({
    paths: {
      template: "/templates/"
    }
  });

  equals(this.options.paths.template, "/templates/", "Override paths globally");
});

test("instance", function() {
  var main = new Backbone.LayoutManager({
    name: "main-layout",

    paths: {
      layout: "/layouts/"
    }
  });

  equals(main.options.paths.layout, "/layouts/", "Override paths locally");
});

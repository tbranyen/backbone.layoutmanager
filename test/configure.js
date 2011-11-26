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

  equal(this.options.key, undefined, "Invalid assignment");
});

test("global", function() {
  Backbone.LayoutManager.configure({
    paths: {
      template: "/templates/"
    }
  });

  equal(this.options.paths.template, "/templates/", "Override paths globally");
});

test("instance", function() {
  var main = new Backbone.LayoutManager({
    name: "main-layout",

    paths: {
      layout: "/layouts/"
    }
  });

  equal(main.options.paths.layout, "/layouts/", "Override paths locally");

  notEqual(this.options.paths.template, "/templates/", "Do not override globals");
});

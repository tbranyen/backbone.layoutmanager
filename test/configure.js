module("configure", {
  setup: function() {
    this.options = Backbone.LayoutManager.prototype.options;
  }
});

test("defaults", function() {
  deepEqual(this.options.paths, {}, "No paths");
});

test("invalid", function() {
  Backbone.LayoutManager.configure("key", "val");

  equals(Backbone.LayoutManager.prototype.options.key, undefined);
});

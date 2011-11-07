(function() {

Backbone.LayoutManager = Backbone.View.extend({
  
  initialize: function(opts) {
    // Handle partials support
    var partials = {};

    // Mix in the partials function
    if (_.isFunction(this.partials)) {
      _.extend(partials, this.partials.call(this));

    // Mix in the partials object
    } else if (_.isObject(this.partials)) {
      _.extend(partials, this.partials);
    }

    // Assign the new partials object
    this.partials = partials;

    // Stores all templates
    this.cache = {};

    // Ensure no scoping issues internally
    _.bindAll(this, "render");
  },

  partials: function() {
    return {};
  },

  render: function(done) {
    var manager = this.options;

    // Passed to view render methods
    function layoutCallback(view) {
      var _context = {};

      function render(context) {
        var contents, template;

        function cont(_contents) {
          contents = _contents;

          // Compile template
          template = manager.compile(contents);

          // Render the partial
          return manager.render(template, _context);
        }

        // Use to allow for methods to become async
        var handler = { async: function() {
          return cont;
        }};

        // Seek out serialize method and extend
        if (!context && _.isFunction(view.serialize)) {
          _.extend(_context, view.serialize.call(view));

        // Extend passed context object
        } else if (_.isObject(context)) {
          _.extend(_context, context);
        }

        // Fetch layout and template contents
        if (contents = manager.fetch.call(handler, view.template)) {
          cont(contents);
        }
      }

      return { render: render };
    }

    var layout;

    // Use to allow for methods to become async
    var handler = { async: function() {
      return cont;
    }};

    // Get layout contents
    if (layout = manager.fetch.call(handler, manager.name)) {
      cont(layout);
    }

    function cont(_layout) {
      layout = _layout;

      // Iterate over each partial and apply the render method
      _.each(this.partials, function(view, name) {
        // Render into a variable
        var contents = view.render(layoutCallback);

        // Apply partially
        layout = manager.partial(layout, name, contents);
      });

      done(layout);
    }
  }

});

// Set global configuration options
Backbone.LayoutManager.configure = function(opts) { 
  if (_.isObject(opts)) {
    _.extend(Backbone.LayoutManager.prototype, opts);
  }
};

})();

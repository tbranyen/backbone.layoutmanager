//(function() {

Backbone.LayoutManager = Backbone.View.extend({
  
  //constructor: function() {
  //  
  //},
  
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

    // Get layout contents
    var layout = manager.fetch(manager.name);

    // Passed to view render methods
    function layoutCallback(view) {
      var _context = {};

      function render(context) {
        // Seek out serialize method and extend
        if (!context && _.isFunction(view.serialize)) {
          _.extend(_context, view.serialize.call(view));

        // Extend passed context object
        } else if (_.isObject(context)) {
          _.extend(_context, context);
        }

        // Fetch layout and template contents
        var contents = manager.fetch(view.template);

        // Compile template
        var template = manager.compile(contents);

        // Render the partial
        return manager.render(template, _context);
      }

      return { render: render };
    }

    // Iterate over each partial and apply the render method
    _.each(this.partials, function(view, name) {
      // Render into a variable
      var contents = view.render(layoutCallback);

      // Apply partially
      layout = manager.partial(layout, name, contents);
    });

    done(layout);
  }

});

// Set global configuration options
Backbone.LayoutManager.configure = function(opts) { 
  if (_.isObject(opts)) {
    _.extend(Backbone.LayoutManager.prototype, opts);
  }
};

//})();

/* backbone.layoutmanager.js v0.0.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function() {

// Enforce strict mode
"use strict";

// LayoutManager at its core is specifically a Backbone.View
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

    // Ensure no context issues internally
    _.bindAll(this);

    // Merge in the default options
    this.options = _.extend({}, Backbone.LayoutManager, this.options);

    // Call any options intialize that may have been passed
    _.isFunction(this.options.initialize) && this.options.initialize.apply(this, arguments)
  },

  render: function(done) {
    var layout, handler, prefix;
    var manager = this;
    var options = this.options;

    function cont(_layout) {
      // Inject into el
      layout = manager.el;
      layout.innerHTML = _layout;

      // Iterate over each partial and apply the render method
      _.each(manager.partials, function(view, name) {
        // Render into a variable
        view.render(layoutCallback).done = function(contents) {
          // Apply partially
          options.partial(layout, name, contents);
        };
      });

      done(layout);
    }

    // Passed to view render methods
    function layoutCallback(view) {
      var _context = {};

      function render(context) {
        var contents, template;

        var cont = function(_contents) {
          contents = _contents;

          // Render the partial
          view.el.innerHTML = options.render.call(options, contents, _context);

          // Signal that the fetching is done
          handler.done(view.el);
        };

        // Use to allow for methods to become async
        var handler = {
          async: function() {
            return cont;
          },

          done: $.noop
        };

        // Seek out serialize method and extend
        if (!context && _.isFunction(view.serialize)) {
          _.extend(_context, view.serialize.call(view));

        // Extend passed context object
        } else if (_.isObject(context)) {
          _.extend(_context, context);
        }

        // Set the prefix
        prefix = options.paths && options.paths.template || "";

        // Fetch layout and template contents
        if (contents = options.fetch.call(handler, prefix + view.template)) {
          cont(contents);
        }

        return handler;
      }

      return { render: render };
    }

    // Use to allow for methods to become async
    handler = {
      async: function() {
        return cont;
      }
    };

    prefix = options.paths && options.paths.layout || "";

    // Get layout contents
    if (layout = options.fetch.call(handler, prefix + options.name)) {
      return cont(layout);
    }
  }

},

// Constructor properties
{
  // Set global configuration options
  configure: function(opts) { 
    var options = Backbone.LayoutManager.prototype.options;

    if (_.isObject(opts)) {
      Backbone.LayoutManager.prototype.options = _.extend({}, options, opts);
    }
  }
});

// Defaults
Backbone.LayoutManager.prototype.options = {
  engine: _.template,

  // ASYNC fetch a template
  fetch: function(path) {
    var done = this.async();

    $.get(path, function(data) {
      done(data);
    });
  },

  // Handling partials
  partial: function(layout, name, template) {
    $(layout).find(name).html(template);
  },

  render: _.identity
};

}).call(this);

/* backbone.layoutmanager.js v0.0.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function() {

// Enforce strict mode
"use strict";

// LayoutManager at its core is specifically a Backbone.View
var LayoutManager = Backbone.LayoutManager = Backbone.View.extend({

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

    // Ensure no context issues internally
    _.bindAll(this);

    // Merge in the default options
    this.options = _.extend({}, Backbone.LayoutManager, this.options);

    // Call any options intialize that may have been passed
    _.isFunction(this.options.initialize) && this.options.initialize.apply(this, arguments)
  },

  render: function(done) {
    var contents, prefix, url;
    var manager = this;
    var options = this.options;

    // Returns an object that provides asynchronous capabilities.
    function async(done) {
      var handler = new $.Deferred;

      handler.async = function() {
        return done;
      };

      return handler;
    }

    // Passed to each View's render.  This function handles the wrapped
    // View and the call to render.
    function viewRender(view) {
      // Once the template is successfully fetched, use its contents to
      // proceed.
      function templateDone(contents, context) {
        // Ensure the cache is up-to-date
        LayoutManager.cache(url, contents);

        // Render the partial into the View's el property.
        view.el.innerHTML = options.render.call(options, contents, context);

        // Signal that the fetching is done, wrap in a setTimeout to ensure,
        // that synchronous calls do not break the done being triggered.
        handler.resolve(view.el)
      }

      var url;
      // Create an asynchronous handler.
      var handler = async(templateDone);

      // Return the render method for View's to call.
      return {
        // Render accepts an option context object.
        render: function(context) {
          // Seek out serialize method and use that object.
          if (!context && _.isFunction(view.serialize)) {
            context = view.serialize.call(view);
          }

          // Set the prefix
          prefix = options.paths && options.paths.template || "";
          
          // Set the url to the prefix + the view's template property.
          url = prefix + view.template;
          
          // Check if contents are already cached
          if (contents = LayoutManager.cache(url)) {
            templateDone(contents, context, url);

            return handler;
          }

          // Fetch layout and template contents
          contents = options.fetch.call(handler, prefix + view.template);

          // If the function was synchronous, continue execution.
          if (contents) {
            templateDone(contents, context);
          }

          return handler;
        }
      };
    }

    // Once the layout is successfully fetched, use its contents to proceed.
    function layoutDone(contents) {
      // Ensure the cache is up-to-date
      LayoutManager.cache(url, contents);

      // Set the contents of the layout element.
      manager.el.innerHTML = contents;

      // Iterate over each partial and apply the render method
      _.each(manager.partials, function(view, name) {
        // Render into a variable
        view.render(viewRender).then(function(contents) {
          // Apply partially
          options.partial(manager.el, name, contents);
        });
      });

      // Call the original LayoutManager render method callback, with the
      // DOM element containing the layout and sub views.
      done(manager.el);
    }

    // This is essentially the pathing prefix.
    prefix = options.paths && options.paths.layout || "";

    // Set the url to the prefix + the layouts name property.
    url = prefix + options.name;

    // Check if contents are already cached
    if (contents = LayoutManager.cache(url)) {
      return layoutDone(contents);
    }

    // Get layout contents
    contents = options.fetch.call(async(layoutDone), url);

    // If the function was synchronous, continue execution.
    if (contents) {
      return layoutDone(contents);
    }
  }

},
{
  // Clearable cache
  _cache: {},

  // Cache templates into LayoutManager._cache
  // @path     : View's template property.
  // @contents : Template content's to cache.
  cache: function(path, contents) {
    // If template path is found in the cache, return the contents.
    if (path in this._cache) {
      return this._cache[path];

    // Ensure path and contents aren't undefined
    } else if (path != null && contents != null) {
      return this._cache[path] = contents;
    }

    // If template is not in the cache, return undefined.
  },
  
  // This static method allows for global configuration of LayoutManager.
  configure: function(opts) { 
    var options = Backbone.LayoutManager.prototype.options;

    // Without this check the application would react strangely to a foreign
    // input.
    if (_.isObject(opts)) {
      // Directly 
      Backbone.LayoutManager.prototype.options = _.extend(options, opts);
    }
  }
});

// Default configuration options; designed to be overriden.
// Paths  : Template and layout properties containing paths to prefix for fetch.
// Fetch  : Returns template contents as a string.
// Partial: Injects template into the layout.
// Render : Used to combine context objects to templates.
Backbone.LayoutManager.prototype.options = {
  paths: {},

  // Fetch is passed a path and is expected to return template contents as a
  // string.  As you can see below assigning this.async() to a variable
  // can be used for asynchronous operations.
  fetch: function(path) {
    var done = this.async();

    // Do a basic GET for the file path and call done.
    $.get(path, function(data) {
      done(data);
    });
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  //
  // @Layout   : Is the LayoutManager's el property.
  // @Name     : Is the key name specified in the partial assignment.
  // @Template : Is the View's el property.
  partial: function(layout, name, template) {
    $(layout).find(name).html(template);
  },

  // By default render shouldn't do anything special.
  render: _.identity
};

}).call(this);

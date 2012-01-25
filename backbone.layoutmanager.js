/*!
 * backbone.layoutmanager.js v0.1.1
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function(Backbone, _, $) {

// Allows the setting of multiple views instead of a single view
function setViews(views) {
  // Iterate over all the views and use the View's view method to assign.
  _.each(views, function(view, name) {
    // Assign each view
    this.view(name, view);
  }, this);
}

function view(name, subView) {
  // Maintain a reference to the manager
  var manager = this;
  // Shorthand options
  var options = this.options;

  // Returns an object that provides asynchronous capabilities.
  function async(done) {
    var handler = options.deferred();

    // Used to handle asynchronous renders
    handler.async = function() {
      handler._isAsync = true;

      return done;
    };

    // This is used internally for when to apply to a layout
    handler.partial = options.deferred();

    return handler;
  }

  // Passed to each View's render.  This function handles the wrapped
  // View and the call to render.
  function viewRender(view) {
    var url, handler, prefix, contents;
    
    // Once the template is successfully fetched, use its contents to
    // proceed.
    function templateDone(context, contents) {
      // Ensure the cache is up-to-date.
      LayoutManager.cache(url, contents);

      // Render the View into the el property.
      options.html(view.el, options.render(contents, context));

      // Signal that the fetching is done, wrap in a setTimeout to ensure,
      // that synchronous calls do not break the done being triggered.
      handler.partial.resolve(view.el);

      // Render any additional views.
      renderViews(view, view.views);
    }

    // Reset the internal views array during every render.
    view.views = {};

    // Return the render method for View's to call.
    return {
      // Allows additional views to be inserted at render time.
      insert: function(partial, subView) {
        // Create or append to views object
        var views = view.views;

        // Create or append to partials array
        var viewPartial = views[partial] = views[partial] || [];

        // Push the subView into the stack of partials
        viewPartial.push(subView); 

        // Add the reusable view method to all views added this way as well.
        subView.view = view;

        // Add the reusable bulk setViews method as well.
        subView.setViews = setViews;

        // Keep the chain going
        return subView;
      },

      // Render accepts an option context object.
      render: function(context) {
        // Seek out serialize method and use that object.
        if (!context && _.isFunction(view.serialize)) {
          context = view.serialize.call(view);
        // If serialize already is an object, just use that
        } else if (!context && _.isObject(view.serialize)) {
          context = view.serialize;
        }

        // Create an asynchronous handler.
        handler = async(_.bind(templateDone, manager, context));

        // Set the prefix
        prefix = options.paths && options.paths.template || "";
        
        // Set the url to the prefix + the view's template property.
        if (_.isString(view.template)) {
          url = prefix + view.template;
        }
        
        // Check if contents are already cached
        if (contents = LayoutManager.cache(url)) {
          templateDone(context, contents, url);

          return handler;
        }

        // Fetch layout and template contents
        if (_.isString(view.template)) {
          contents = options.fetch.call(handler, prefix + view.template);
        // If its not a string just pass the object/function/whatever
        } else {
          contents = options.fetch.call(handler, view.template);
        }

        // If the function was synchronous, continue execution.
        if (!handler._isAsync) {
          templateDone(context, contents);
        }

        return handler;
      }
    };
  }

  // Wraps the View's original render to supply a reusable render method
  function wrappedRender(root, name, view) {
    var original = view.render;

    // This render method accepts no arguments and will simply update the
    // SubView from the rules provided inside the render method.
    return function() {
      // Always remove the view when re-rendering
      view.remove();

      // Render into a variable
      var viewDeferred = original.call(view, viewRender);

      // Internal partial deferred used for injecting into layout
      viewDeferred.partial.then(function(el) {
        // Apply partially
        options.partial(root.el, name, el, view.options.append);

        // Once added to the DOM resolve original deferred, with the correct
        // view element.
        viewDeferred.resolve(view.el).then(function(el) {
          // Ensure events are rebound
          view.delegateEvents();
        });

        // If the view contains a views object, iterate over it as well
        if (_.isObject(view.options.views)) {
          return renderViews(view, view.options.views);
        }
      });

      // This will be useful to allow wrapped renders to know when they are
      // done as well
      return viewDeferred;
    };
  }

  // Recursively iterate over each View and apply the render method
  function renderViews(root, views) {
    // Take in a view and a name and perform mighty magic to ensure the
    // template is loaded and rendered.  Wraps in a new render method so
    // that you can call to update a single model.  May be optionally
    // asynchronous if the done callback is provided.
    function processView(view, name, done) {
      view.remove();
      // Wrap a new reusable render method, ensure that a wrapped flag is 
      // set to prevent double wrapping.
      if (!view.render._wrapped) {
        view.render = wrappedRender(root, name, view);

        // This flag is used to determine which render method is being looked
        // at.
        view.render._wrapped = true;
      }

      // Render each View
      view.render().then(done);
    }

    // For each view access the view object and partial name
    _.each(views, function(view, name) {
      // Take each subView and pipe it into the processView function
      function iterateViews(views) {
        // Remove the currentView from the views array and assign it
        // to be a SubView.
        var subView = views.shift();

        // Automatically convert lists to append
        subView.options.append = true;

        // Process the views serially
        processView(subView, name, function() {
          // Recurse to the next view
          if (views.length) {
            iterateViews(views);
          }
        });
      }

      // If the views is an array render out as a list
      if (_.isArray(view)) {
        // Reset the `el` state
        options.partial(root.el, name, "");

        iterateViews(_.clone(view));
      // Process a single view
      } else {
        processView(view, name);
      }
    });
  }

  // Determine if we are already dealing with a wrapped render function, if
  // so, do not attempt to re-wrap.
  if (!subView.render._wrapped) {
    subView.render = wrappedRender(manager, name, subView);

    // This flag is used to determine which render method is being looked
    // at.
    subView.render._wrapped = true;
  }

  // Add the reusable view function reference to every view added this way.
  subView.view = view;
  // Add the reusable bulk setViews method as well.
  subView.setViews = setViews;

  return this.views[name] = subView;
}

// LayoutManager at its core is specifically a Backbone.View
var LayoutManager = Backbone.LayoutManager = Backbone.View.extend({
  initialize: function() {
    var prefix, url;
    // Handle views support
    var views = {};
    // Maintain a reference to the manager
    var manager = this;

    // Mix in the views function
    if (_.isFunction(this.options.views)) {
      _.extend(views, this.options.views.call(this));
      delete this.options.views;
    // Mix in the views object
    } else if (_.isObject(this.options.views)) {
      _.extend(views, this.options.views);
      delete this.options.views;
    }

    // Assign the new views object
    this.views = {};

    // Assign each sub View into the manager
    _.each(views, function(view, name) {
      manager.view(name, view);
    });

    // Merge in the default options
    this.options = _.extend({}, Backbone.LayoutManager, this.options);

    // Call any options intialize that may have been passed
    if (_.isFunction(this.options.initialize)) {
      this.options.initialize.apply(this, arguments);
    }

    // Ensure no context issues internally
    _.bindAll(this);

    // If there is no template or serialize property supplied attempt to pull
    // off instance, this should allow for extending easier.
    _.each(["template", "serialize"], function(prop) {
      if (!this.options[prop] && this[prop]) {
        this.options[prop] = this[prop];
      }
    }, this);

    // If events exist rip off and place on layout view
    if (this.options.events) {
      // Assign to top level so delegateEvents will work as expected
      this.events = this.options.events;
      // Delete off options
      delete this.options.events;

      _.each(this.events, function(method) {
        this[method] = this.options[method];

        // Delete method off options
        delete this.options[method];
      }, this);

      // Ensure events are bound on the layout.
      this.delegateEvents();
    }
  },
  
  // Provided to a top level layout to allow direct assignment of a SubView.
  view: view,

  // This allows a bulk replacement of all existing views
  setViews: setViews,

  render: function(done) {
    var contents, prefix, url, handler;
    var manager = this;
    var options = this.options;

    // Returns an object that provides asynchronous capabilities.
    function async(done) {
      var handler = options.deferred();

      // Used to handle asynchronous renders
      handler.async = function() {
        handler._isAsync = true;

        return done;
      };

      // This is used internally for when to apply to a layout
      handler.partial = options.deferred();

      return handler;
    }

    // Once the layout is successfully fetched, use its contents to proceed.
    function layoutDone(contents) {
      // Empty object if context is not provided
      var context = {};

      // Ensure the cache is up-to-date
      LayoutManager.cache(url, contents);

      // Context is a function
      if (_.isFunction(options.serialize)) {
        context = options.serialize.call(manager);
      // Context is an object
      } else if (_.isObject(options.serialize)) {
        context = options.serialize;
      }

      // Set the layout
      options.html(manager.el, options.render(contents, context));

      // Render the top-level views from the LayoutManager
      _.each(manager.views, function(view) {
        view.render();
      });

      // Call the original LayoutManager render method callback, with the
      // DOM element containing the layout and sub views.
      done(manager.el);
    }

    // This is essentially the pathing prefix.
    prefix = options.paths && options.paths.layout || "";

    // Set the url to the prefix + the layouts template property.
    if (_.isString(options.template)) {
      url = prefix + options.template;
    // If the template is not a string, don't prepend the prefix
    } else {
      url = options.template;
    }

    // Check if contents are already cached
    if (contents = LayoutManager.cache(url)) {
      return layoutDone(contents);
    }

    // Get layout contents
    handler = async(layoutDone);
    contents = options.fetch.call(handler, url);

    // If the function was synchronous, continue execution.
    if (!handler._isAsync) {
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
      _.extend(options, opts);
    }
  },

  View: Backbone.View.extend({
    // Render is given a callback layout which internally wraps the view
    // and has a render function that is callable. which you can pass an
    // object to.
    render: function(layout) {
      return layout(this).render();
    }
  })
});

// Default configuration options; designed to be overriden.
Backbone.LayoutManager.prototype.options = {

  // Layout and template properties can be assigned here to prefix
  // template/layout names.
  paths: {},

  // Can be used to supply a different deferred that implements Promises/A.
  deferred: function() {
    return $.Deferred();
  },

  // Fetch is passed a path and is expected to return template contents as a
  // string.
  fetch: function(path) {
    return $(path).html();
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  //
  // layout   : Is the LayoutManager's el property.
  // name     : Is the key name specified in the view assignment.
  // template : Is the View's el property.
  // append   : Should the view be appended?
  partial: function(layout, name, template, append) {
    if (append) {
      this.append($(layout).find(name), template);
    } else {
      this.html($(layout).find(name), template);
    }
  },

  // Override this with a custom HTML method, passed a root element and an
  // element to replace the innerHTML with.
  html: function(root, el) {
    $(root).html(el);
  },

  // Very similar to HTML except this one will appendChild.
  append: function(root, el) {
    $(root).append(el);
  },

  // By default, render using underscore's templating.
  render: function(template, context) {
    return _.template(template)(context);
  }

};

})(this.Backbone, this._, this.jQuery);



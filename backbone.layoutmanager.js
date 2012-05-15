/*!
 * backbone.layoutmanager.js v0.4.1
 * Copyright 2012, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function(window) {

"use strict";

// Alias the libraries from the global object
var Backbone = window.Backbone;
var _ = window._;
var $ = window.$;

// Accept either a single view or an array of views to clean of all DOM events
// internal model and collection references and all Backbone.Events.
function cleanViews(views) {
  // Clear out all existing views
  _.each([].concat(views), function(view) {
    // Remove all custom events attached to this View
    view.unbind();

    // Ensure all nested views are cleaned as well
    if (view.views) {
      _.each(view.views, function(view) {
        cleanViews(view);
      });
    }

    // If a custom cleanup method was provided on the view, call it after
    // the initial cleanup is done
    if (_.isFunction(view.cleanup)) {
      view.cleanup.call(view);
    }
  });
}

// This gets passed to all _render methods.
function viewRender(root) {
  var url, contents, handler;
  var options = root._options();

  // Once the template is successfully fetched, use its contents to
  // proceed.  Context argument is first, since it is bound for
  // partial application reasons.
  function done(context, contents) {
    // Ensure the cache is up-to-date.
    LayoutManager.cache(url, contents);

    // Render the View into the el property.
    if (contents) {
      options.html(root.el, options.render(contents, context));
    }

    // Resolve only the fetch (used internally) deferred with the View element.
    handler.fetch.resolveWith(root, [root.el]);
  }

  return {
    // Shorthand to root.view function with append flag.
    insert: function(partial, view) {
      if (view) {
        return root.view(partial, view, true);
      }

      return root.view(partial, true);
    },

    // Expose the actual raw View instance.
    raw: root,

    // This render function is what gets called inside of the View render,
    // when manage(this).render is called.  Returns a promise that can be used
    // to know when the element has been rendered into its parent.
    render: function(context) {
      var template = root.template || options.template;

      if (root.serialize) {
        options.serialize = root.serialize;
      }

      // Seek out serialize method and use that object.
      if (!context && _.isFunction(options.serialize)) {
        context = options.serialize.call(root);
      // If serialize is an object, just use that
      } else if (!context && _.isObject(options.serialize)) {
        context = options.serialize;
      }

      // Create an asynchronous handler
      handler = LayoutManager._makeAsync(options, _.bind(done, root, context));

      // Make a new deferred purely for the fetch function
      handler.fetch = options.deferred();

      // Assign the handler internally to be resolved once its inside the
      // parent element.
      root.__manager__.handler = handler;

      // Set the url to the prefix + the view's template property.
      if (_.isString(template)) {
        url = root._prefix + template;
      }

      // Check if contents are already cached
      if (contents = LayoutManager.cache(url)) {
        done(context, contents, url);

        return handler;
      }

      // Fetch layout and template contents
      if (_.isString(template)) {
        contents = options.fetch.call(handler, root._prefix + template);
      // If its not a string just pass the object/function/whatever
      } else if (template != null) {
        contents = options.fetch.call(handler, template);
      }

      // If the function was synchronous, continue execution.
      if (!handler._isAsync) {
        done(context, contents);
      }

      return handler;
    }
  };
}

var LayoutManager = Backbone.View.extend({
  // Internal state object used to store whether or not a View has been
  // taken over by layout manager and if it has been rendered into the DOM.
  __manager__: {},

  // This is a named function to improve logging and debugging within browser
  // dev tools.  Typically you do not use "anonymous" named functions since IE
  // has a well known bug, BUT I think we all know the reason why I'm ignoring
  // that here.
  constructor: function LayoutManager(options) {
    var proto = Backbone.LayoutManager.prototype;
    // Extend the options with the prototype and passed options
    options = _.extend({}, proto.options, options);

    // Apply the default render scheme.
    this._render = function(manage) {
      return manage(this).render();
    };

    // Set up top level views object
    this.views = {};

    // If the user provided their own render override, use that instead of the
    // default.
    if (this.render !== proto.render) {
      this._render = this.render;
      this.render = proto.render;
    }

    // By default the original Remove function is the Backbone.View one.
    this._remove = Backbone.View.prototype.remove;

    // If the user provided their own remove override, use that instead of the
    // default.
    if (this.remove !== proto.remove) {
      this._remove = this.remove;
      this.remove = proto.remove;
    }
    
    // Set the prefix for a layout
    if (options.paths) {
      this._prefix = options.paths.layout || "";
    }

    // Set the internal views
    if (options.views) {
      this.setViews(options.views);
    }

    // Ensure the template is mapped over
    if (this.template) {
      options.template = this.template;
    }

    Backbone.View.call(this, options);
  },

  // Allows the setting of multiple views instead of a single view.
  setViews: function(views) {
    // Iterate over all the views and use the View's view method to assign.
    _.each(views, function(view, name) {
      // If the view is an array put all views into insert mode
      if (_.isArray(view)) {
        _.each(view, function(view) {
          this.view(name, view, true);
        }, this);

      // Assign each view using the view function
      } else {
        this.view(name, view);
      }
    }, this);

    // Allow for chaining
    return this;
  },

  // This takes in a partial name and view instance and assigns them to
  // the internal collection of views.  If a view is not a LayoutManager
  // instance, then mix in the LayoutManager prototype.  This ensures
  // all Views can be used successfully.
  //
  // Must definitely wrap any render method passed in or defaults to a
  // typical render function `return layout(this).render()`.
  view: function(name, view, append) {
    var partials, options;
    var root = this;

    // If no name was passed, use an empty string and shift all arguments.
    if (!_.isString(name)) {
      append = view;
      view = name;
      name = "";
    }

    // Ensure a view always has a views object
    if (!this.views) {
      this.views = {};
    }

    // If this view has not been managed yet, ensure its set up to work with
    // LayoutManager correctly (proper variables and functions).
    if (!view.__manager__) {
      // Internal property necessary for every View.
      view.__manager__ = {};

      // Add in all missing LayoutManager properties and methods.
      if (!(view instanceof LayoutManager)) {
        view._render = view.render;

        // If no render override was specified assign the default
        if (view.render === Backbone.View.prototype.render) {
          view._render = function(layout) {
            return layout(this).render();
          };
        }

        if (view.views) {
          view.options.views = view.views;
        }

        // Mix in reusable properties
        _.extend(view, {
          views: {},
          view: LayoutManager.prototype.view,
          setViews: LayoutManager.prototype.setViews,
          _options: LayoutManager.prototype._options
        });
      }

      // Append View's get managed inside the render callback.
      if (!append) {
        view.__manager__.isManaged = true;
      }

      // Keep a copy of the remove function (overwritten).
      view._remove = view.remove;

      // Ensure the cleanup function is called whenever remove is called.
      view.remove = LayoutManager.prototype.remove;

      view.render = function(done) {
        var viewDeferred = options.deferred();
        
        // Break this callback out so that its not duplicated inside the 
        // following safety try/catch.
        function renderCallback() {
          // Only refresh the view if its not a list item, otherwise it would
          // cause duplicates.
          if (!view.__manager__.hasRendered) {
            // Only if the partial was successful.
            if (options.partial(root.el, name, view.el, append)) {
              // Set the internal rendered flag, since the View has finished
              // rendering.
              view.__manager__.hasRendered = true;
            }

            // Resolve the View's render handler deferred.
            view.__manager__.handler.resolveWith(view, [view.el]);

            // Ensure DOM events are properly bound.
            view.delegateEvents();
          }

          // When a view has been resolved, ensure that it is correctly updated
          // and that any done callbacks are triggered.
          viewDeferred.resolveWith(view, [view.el]);

          // Only call the done function if a callback was provided.
          if (_.isFunction(done)) {
            done.call(view, view.el);
          }
        }

        // Call the original render method
        LayoutManager.prototype.render.call(view, renderCallback);

        return viewDeferred.promise();
      };

      // Instance overrides take precedence, fallback to prototype options.
      options = view._options();

      // Set the prefix for a layout.
      if (!view._prefix && options.paths) {
        view._prefix = options.paths.template || "";
      }

      // Set the internal views.
      if (options.views) {
        view.setViews(options.views);
      }
    }

    // Special logic for appending items. List items are represented as an
    // array.
    if (append) {
      partials = this.views[name] = this.views[name] || [];
      partials.push(view);

      return view;
    }

    // Assign to main views object and return for chainability.
    return this.views[name] = view;
  },

  // By default this should find all nested views and render them into
  // the this.el and call done once all of them have successfully been
  // resolved.
  //
  // This function returns a promise that can be chained to determine
  // once all subviews and main view have been rendered into the view.el.
  render: function(done) {
    var root = this;
    var options = this._options();
    var viewDeferred = options.deferred();

    // Disable ability to render more than once at a time.
    if (root.__manager__.renderDeferred) {
      return root.__manager__.renderDeferred;
    }

    // Disable the ability for any new sub-views to be added.
    root.__manager__.renderDeferred = viewDeferred;

    // Wait until this View has rendered before dealing with nested Views.
    this._render(viewRender).fetch.then(function() {
      // Create a list of promises to wait on until rendering is done. Since
      // this method will run on all children as well, its sufficient for a
      // full hierarchical. 
      var promises = _.map(root.views, function(view) {
        // Hoist deferred var, used later on...
        var def;

        // Ensure views are rendered in sequence
        function seqRender(views, done) {
          // Once all views have been rendered invoke the sequence render
          // callback
          if (!views.length) {
            return done();
          }

          // Get each view in order, grab the first one off the stack
          var view = views.shift();

          // This View is now managed by LayoutManager *toot*.
          view.__manager__.isManaged = true;

          // Render the View and once complete call the next view.
          view.render(function() {
            // Invoke the recursive sequence render function with the remaining
            // views
            seqRender(views, done);
          });
        }

        // If rendering a list out, ensure they happen in a serial order
        if (_.isArray(view)) {
          def = options.deferred();

          seqRender(_.clone(view), function() {
            def.resolve();
          });

          return def.promise();
        }

        // This View is now managed by LayoutManager *toot*.
        view.__manager__.isManaged = true;

        // Only return the fetch deferred, resolve the main deferred after the
        // element has been attached to it's parent.
        return view.render();
      });

      // Once all subViews have been rendered, resolve this View's deferred.
      options.when(promises).then(function() {
        viewDeferred.resolveWith(root, [root.el]);
      });
    });

    // Return a promise that resolves once all immediate subViews have
    // rendered.
    return viewDeferred.then(function() {
      // Only call the done function if a callback was provided.
      if (_.isFunction(done)) {
        done.call(root, root.el);
      }

      // Remove the rendered deferred
      delete root.__manager__.renderDeferred;
    }).promise();
  },

  // Ensure the cleanup function is called whenever remove is called.
  remove: function() {
    cleanViews(this);

    // Call the original remove function
    return this._remove.apply(this, arguments);
  },

  // Merge instance and global options.
  _options: function() {
    // Instance overrides take precedence, fallback to prototype options.
    return _.extend({}, LayoutManager.prototype.options, this.options);
  }
},
{
  // Clearable cache
  _cache: {},

  // Creates a deferred and returns a function to call when finished.
  _makeAsync: function(options, done) {
    var handler = options.deferred();

    // Used to handle asynchronous renders
    handler.async = function() {
      handler._isAsync = true;

      return done;
    };

    return handler;
  },

  // Cache templates into LayoutManager._cache
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
    _.extend(LayoutManager.prototype.options, opts);
  }
});

// Ensure all Views always have access to setView and view
Backbone.View.prototype.view = LayoutManager.prototype.view;
Backbone.View.prototype.setViews = LayoutManager.prototype.setViews;

// Attach to Backbone
Backbone.LayoutManager = LayoutManager;
// Legacy support
Backbone.LayoutManager.View = Backbone.View;

// Default configuration options; designed to be overriden.
LayoutManager.prototype.options = {

  // Layout and template properties can be assigned here to prefix
  // template/layout names.
  paths: {},

  // Can be used to supply a different deferred that implements Promises/A.
  deferred: function() {
    return $.Deferred();
  },

  // Fetch is passed a path and is expected to return template contents as a
  // function or string.
  fetch: function(path) {
    return _.template($(path).html());
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  partial: function(root, name, el, append) {
    // If no selector is specified, assume the parent should be added to.
    var $root = name ? $(root).find(name) : $(root);

    // If no root found, return false
    if (!$root.length) {
      return false;
    }

    // Use the append method if append argument is true.
    this[append ? "append" : "html"]($root, el);

    // If successfully added, return true
    return true;
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

  // Abstract out the $.fn.detach method
  detach: function(el) {
    $(el).detach();
  },

  // Return a deferred for when all promises resolve/reject.
  when: function(promises) {
    return $.when.apply(null, promises);
  },

  // By default, render using underscore's templating.
  render: function(template, context) {
    return template(context);
  }

};

})(this);


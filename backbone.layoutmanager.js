/*!
 * backbone.layoutmanager.js v0.6
 * Copyright 2012, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function(window) {

"use strict";

// Alias the libraries from the global object.
var Backbone = window.Backbone;
var _ = window._;
var $ = window.$;

// Store references to original View functions.
var _configure = Backbone.View.prototype._configure;
var render = Backbone.View.prototype.render;

// A LayoutManager is simply a Backbone.View with some sugar.
var LayoutManager = Backbone.View.extend({
  // This named function allows for significantly easier debugging.
  constructor: function Layout(options) {
    options = options || {};

    // Ensure the View is setup correctly.
    LayoutManager.setupView(this, options);

    // Set the prefix for a layout.
    if (options.paths) {
      this._prefix = options.paths.layout || "";
    }

    // Have Backbone set up the rest of this View.
    Backbone.View.call(this, options);
  },

  // Shorthand to root.view function with append flag.
  insertView: function(selector, view) {
    if (view) {
      return this.setView(selector, view, true);
    }

    // Omitting a selector will place the View directly into the parent.
    return this.setView(selector, true);
  },

  // Works like insertView, except allows you to bulk insert via setViews.
  insertViews: function(views) {
    // Ensure each view is wrapped in an array.
    _.each(views, function(view, selector) {
      views[selector] = [].concat(view);
    });

    return this.setViews(views);
  },

  // Will return a single view that matches the filter function.
  getView: function(fn) {
    return this.getViews(fn).first().value();
  },

  // Provide a filter function to get a flattened array of all the subviews.
  // If the filter function is omitted it will return all subviews.
  getViews: function(fn) {
    // Flatten all views.
    var views = _.chain(this.views).map(function(view) {
      return [].concat(view);
    }, this).flatten().value();

    // Return a wrapped function to allow for easier chaining.
    return _.chain(_.filter(views, fn ? fn : _.identity));
  },

  // This takes in a partial name and view instance and assigns them to
  // the internal collection of views.  If a view is not a LayoutManager
  // instance, then mix in the LayoutManager prototype.  This ensures
  // all Views can be used successfully.
  //
  // Must definitely wrap any render method passed in or defaults to a
  // typical render function `return layout(this).render()`.
  setView: function(name, view, append) {
    var partials, options;
    var root = this;

    // If no name was passed, use an empty string and shift all arguments.
    if (!_.isString(name)) {
      append = view;
      view = name;
      name = "";
    }

    // If the parent View's object, doesn't exist... create it.
    this.views = this.views || {};

    // Ensure remove is called when swapping View's.
    if (!append && this.views[name]) {
      // If the views are an array, iterate and remove each individually.
      if (_.isArray(this.views[name])) {
        _.each(this.views[name], function(view) {
          view.remove();
        });
      // Otherwise it's a single view and can safely call remove.
      } else {
        this.views[name].remove();
      }
    }

    // Instance overrides take precedence, fallback to prototype options.
    options = view._options();

    // Set up the View.
    LayoutManager.setupView(view, options);

    // Custom template render function.
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

          // Ensure DOM events are properly bound.
          view.delegateEvents();
        }

        // Resolve the View's render handler deferred.
        view.__manager__.handler.resolveWith(view, [view.el]);

        // Remove the handler once it has resolved.
        delete view.__manager__.handler;

        // When a view has been resolved, ensure that it is correctly updated
        // and that any done callbacks are triggered.
        viewDeferred.resolveWith(view, [view.el]);

        // Only call the done function if a callback was provided.
        if (_.isFunction(done)) {
          done.call(view, view.el);
        }
      }

      // Remove subViews without the `keep` flag set to `true`.
      view.removeView();

      // Call the original render method.
      LayoutManager.prototype.render.call(view).then(renderCallback);

      // Return the promise for chainability.
      return viewDeferred.promise();
    };

    // Set the prefix for a layout.
    if (!view._prefix && options.paths) {
      view._prefix = options.paths.template || "";
    }

    // Special logic for appending items. List items are represented as an
    // array.
    if (append) {
      // Start with an array if none exists.
      partials = this.views[name] = this.views[name] || [];
      
      if (!_.isArray(this.views[name])) {
        // Ensure this.views[name] is an array.
        partials = this.views[name] = [this.views[name]];
      }

      // Add the view to the list of partials.
      partials.push(view);

      return view;
    }

    // Assign to main views object and return for chainability.
    return this.views[name] = view;
  },

  // Allows the setting of multiple views instead of a single view.
  setViews: function(views) {
    // Iterate over all the views and use the View's view method to assign.
    _.each(views, function(view, name) {
      // If the view is an array put all views into insert mode.
      if (_.isArray(view)) {
        return _.each(view, function(view) {
          this.insertView(name, view);
        }, this);
      }

      // Assign each view using the view function.
      this.setView(name, view);
    }, this);

    // Allow for chaining
    return this;
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

    // Ensure duplicate renders don't override.
    if (root.__manager__.renderDeferred) {
      return root.__manager__.renderDeferred;
    }

    // Disable the ability for any new sub-views to be added.
    root.__manager__.renderDeferred = viewDeferred;

    // Wait until this View has rendered before dealing with nested Views.
    this._render(LayoutManager._viewRender).fetch.then(function() {
      // Create a list of promises to wait on until rendering is done. Since
      // this method will run on all children as well, its sufficient for a
      // full hierarchical. 
      var promises = _.map(root.views, function(view) {
        // Hoist deferred var, used later on...
        var def;

        // Ensure views are rendered in sequence
        function seqRender(views, done) {
          // Once all views have been rendered invoke the sequence render
          // callback.
          if (!views.length) {
            return done();
          }

          // Get each view in order, grab the first one off the stack.
          var view = views.shift();

          // Render the View and once complete call the next view.
          view.render(function() {
            // Invoke the recursive sequence render function with the
            // remaining views.
            seqRender(views, done);
          });
        }

        // If rendering a list out, ensure they happen in a serial order.
        if (_.isArray(view)) {
          // A singular deferred that represents all the items.
          def = options.deferred();

          seqRender(_.clone(view), function() {
            def.resolve();
          });

          return def.promise();
        }

        // Only return the fetch deferred, resolve the main deferred after
        // the element has been attached to it's parent.
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

      // Resolve the View deferred.
      root.__manager__.handler.resolveWith(root, [root]);

      // Remove the rendered deferred.
      delete root.__manager__.renderDeferred;
    }).promise();
  },

  // Ensure the cleanup function is called whenever remove is called.
  remove: function() {
    LayoutManager.cleanViews(this);

    // Call the original remove function.
    return this._remove.apply(this, arguments);
  },

  // Merge instance and global options.
  _options: function() {
    // Instance overrides take precedence, fallback to prototype options.
    return _.extend({}, LayoutManager.prototype.options, this.options);
  }
},
{
  // Clearable cache.
  _cache: {},

  // Creates a deferred and returns a function to call when finished.
  _makeAsync: function(options, done) {
    var handler = options.deferred();

    // Used to handle asynchronous renders.
    handler.async = function() {
      handler._isAsync = true;

      return done;
    };

    return handler;
  },

  // This gets passed to all _render methods.
  _viewRender: function(root) {
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

      // Resolve only the fetch (used internally) deferred with the View
      // element.
      handler.fetch.resolveWith(root, [root.el]);
    }

    return {
      // This render function is what gets called inside of the View render,
      // when manage(this).render is called.  Returns a promise that can be
      // used to know when the element has been rendered into its parent.
      render: function(context) {
        var template = root.template || options.template;

        if (root.serialize) {
          options.serialize = root.serialize;
        }

        // Seek out serialize method and use that object.
        if (!context && _.isFunction(options.serialize)) {
          context = options.serialize.call(root);
        // If serialize is an object, just use that.
        } else if (!context && _.isObject(options.serialize)) {
          context = options.serialize;
        }

        // Create an asynchronous handler.
        handler = LayoutManager._makeAsync(options, _.bind(done, root,
          context));

        // Make a new deferred purely for the fetch function.
        handler.fetch = options.deferred();

        // Assign the handler internally to be resolved once its inside the
        // parent element.
        root.__manager__.handler = handler;

        // Set the url to the prefix + the view's template property.
        if (_.isString(template)) {
          url = root._prefix + template;
        }

        // Check if contents are already cached.
        if (contents = LayoutManager.cache(url)) {
          done(context, contents, url);

          return handler;
        }

        // Fetch layout and template contents.
        if (_.isString(template)) {
          contents = options.fetch.call(handler, root._prefix + template);
        // If its not a string just pass the object/function/whatever.
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
  },

  // Accept either a single view or an array of views to clean of all DOM
  // events internal model and collection references and all Backbone.Events.
  cleanViews: function(views) {
    // Clear out all existing views.
    _.each([].concat(views), function(view) {
      // Remove all custom events attached to this View.
      view.unbind();

      // Ensure all nested views are cleaned as well.
      if (view.views) {
        _.each(view.views, function(view) {
          LayoutManager.cleanViews(view);
        });
      }

      // If a custom cleanup method was provided on the view, call it after
      // the initial cleanup is done
      if (_.isFunction(view.cleanup)) {
        view.cleanup.call(view);
      }
    });
  },

  // Cache templates into LayoutManager._cache.
  cache: function(path, contents) {
    // If template path is found in the cache, return the contents.
    if (path in this._cache) {
      return this._cache[path];
    // Ensure path and contents aren't undefined.
    } else if (path != null && contents != null) {
      return this._cache[path] = contents;
    }

    // If template is not in the cache, return undefined.
  },

  // This static method allows for global configuration of LayoutManager.
  configure: function(opts) {
    _.extend(LayoutManager.prototype.options, opts);

    // Allow LayoutManager to augment Backbone.View.prototype.
    if (opts.augment) {
      Backbone.View.prototype.augment = true;
    }
  },

  // Configure a View to work with the LayoutManager plugin.
  setupView: function(view, options) {
    var proto = Backbone.LayoutManager.prototype;
    var keys = _.keys(LayoutManager.prototype.options);

    // Extend the options with the prototype and passed options.
    options = view.options = _.defaults(options || {}, proto.options);

    // Ensure necessary properties are set.
    _.defaults(view, {
      // Ensure a view always has a views object.
      views: {},

      // Internal state object used to store whether or not a View has been
      // taken over by layout manager and if it has been rendered into the DOM.
      __manager__: {}
    });

    // Pick out the specific properties that can be dynamically added at
    // runtime and ensure they are available on the view object.
    _.extend(options, _.pick(this, keys));

    // Set the render if it is different from the Backbone.View.prototype.
    if (view.render !== Backbone.View.prototype.render) {
      options.render = view.render;
    }

    // By default the original Remove function is the Backbone.View one.
    view._remove = Backbone.View.prototype.remove;

    // Always use this render function when using LayoutManager.
    view._render = function(manage) {
      // If a beforeRender function is defined, call it.
      if (_.isFunction(this.beforeRender)) {
        this.beforeRender.call(this, this);
      }

      // Always emit a beforeRender event.
      this.trigger("beforeRender", this);

      // Render!
      return manage(this).render().then(function() {
        // If an afterRender function is defined, call it.
        if (_.isFunction(this.afterRender)) {
          this.afterRender.call(this, this);
        }

        // Always emit an afterRender event.
        this.trigger("afterRender", this);
      });
    };

    // Ensure the render is always set correctly.
    view.render = LayoutManager.prototype.render;

    // If the user provided their own remove override, use that instead of the
    // default.
    if (view.remove !== proto.remove) {
      view._remove = view.remove;
      view.remove = proto.remove;
    }
    
    // Default the prefix to an empty string.
    view._prefix = "";

    // Set the internal views.
    if (options.views) {
      view.setViews(options.views);
    }

    // Ensure the template is mapped over.
    if (view.template) {
      options.template = view.template;
    }
  },

  // Remove all subViews.
  removeView: function(root) {
    root = root || this;

    // Iterate over all of the view's subViews.
    _.each(root.views, function(views, selector) {
      // Clear out all existing views.
      _.each([].concat(views), function(view) {
        if (_.isBoolean(view.keep) ? !view.keep : !view.options.keep) {
          // Remove the View completely.
          view.remove();

          // If this is an array of items remove items that are not marked to
          // keep.
          if (_.isArray(views)) {
            root.views[selector].splice(selector, 1);
          }
        }
      });
    });
  }
});

// Ensure all Views always have access to get/set/insert(View/Views).
_.each(["get", "set", "insert"], function(method) {
  var backboneProto = Backbone.View.prototype;
  var layoutProto = LayoutManager.prototype;

  // Attach the singular form.
  backboneProto[method + "View"] = layoutProto[method + "View"];

  // Attach the plural form.
  backboneProto[method + "Views"] = layoutProto[method + "Views"];
});

// Convenience assignment to make creating Layout's slightly shorter.
Backbone.Layout = Backbone.LayoutManager = LayoutManager;
// A LayoutView is just a Backbone.View with augment set to true.
Backbone.LayoutView = Backbone.View.extend({
  augment: true
});

// Override _configure to provide extra functionality that is necessary in
// order for the render function reference to be bound during initialize.
Backbone.View.prototype._configure = function() {
  // Run the original _configure.
  var retVal = _configure.apply(this, arguments);

  // If augment is set, do it!
  if (this.augment) {
    // Add the ability to remove all Views.
    this.removeView = LayoutManager.removeView;

    // Add options into the prototype.
    this._options = LayoutManager.prototype._options;

    // Set up this View.
    LayoutManager.setupView(this, this._options());
  }

  // Act like nothing happened.
  return retVal;
};

// Default configuration options; designed to be overriden.
LayoutManager.prototype.options = {

  // Layout and template properties can be assigned here to prefix
  // template/layout names.
  paths: {},

  // Can be used to supply a different deferred implementation.
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

    // If no root found, return false.
    if (!$root.length) {
      return false;
    }

    // Use the append method if append argument is true.
    this[append ? "append" : "html"]($root, el);

    // If successfully added, return true.
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

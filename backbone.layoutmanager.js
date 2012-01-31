/*!
 * backbone.layoutmanager.js v0.2.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function(Backbone, _, $) {

"use strict";

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
    options.html(root.el, options.render(contents, context));

    // Resolve partials with the View element.
    handler.resolve(root.el);
  }

  return {
    // Shorthand to root.view function with append flag
    insert: function(partial, view) {
      return root.view(partial, view, true);
    },

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
      handler = LayoutManager.makeAsync(options, _.bind(done, root, context));

      // Set the url to the prefix + the view's template property.
      if (_.isString(template)) {
        url = root._prefix + template;
      }

      // Check if contents are already cached
      if (contents = LayoutManager.cache(url)) {
        // Make this function act asynchronous to avoid issues with event
        // binding and other unintentional consequences of different timing
        // from synchronous operations.
        setTimeout(function() {
          done(context, contents, url);
        }, 0);

        return handler;
      }

      // Fetch layout and template contents
      if (_.isString(template)) {
        contents = options.fetch.call(handler, root._prefix + template);
      // If its not a string just pass the object/function/whatever
      } else {
        contents = options.fetch.call(handler, template);
      }

      // If the function was synchronous, continue execution.
      if (!handler._isAsync) {
        setTimeout(function() {
          done(context, contents);
        }, 0);
      }

      return handler;
    }
  };
}

function Layout(options) {
  var proto = Backbone.LayoutManager.prototype;
  options = _.extend({}, proto.options, options);

  if (this.render !== proto.render) {
    this._render = this.render;
    this.render = proto.render;

  // If no render override was specified assign the default
  } else {
    // Apply the default render scheme
    this._render = function(layout) {
      return layout(this).render();
    };
  }
  
  // Set the prefix for a layout
  if (options.paths) {
    this._prefix = options.paths.layout || "";
  }

  // Set up top level views object
  this.views = {};

  // Set the internal views
  if (options.views) {
    this.setViews(options.views);
  }

  Backbone.View.apply(this, arguments);
}

var LayoutManager = Backbone.View.extend({
  constructor: Layout,

  // Allows the setting of multiple views instead of a single view.
  setViews: function(views) {
    // Iterate over all the views and use the View's view method to assign.
    _.each(views, function(view, name) {
      // Assign each view using the view function
      this.view(name, view);
    }, this);
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

    // Add in all missing LayoutManager features
    if (!(view instanceof LayoutManager)) {
      // If no render override was specified assign the default
      if (view.render === Backbone.View.prototype.render) {
        view._render = function(layout) {
          return layout(this).render();
        };
      } else {
        view._render = view.render;
      }

      if (view.views) {
        view.options.views = view.views;
      }

      view.views = {};
      view.view = LayoutManager.prototype.view;
      view.setViews = LayoutManager.prototype.setViews;
      view._options = LayoutManager.prototype._options;
    }

    view.render = function(done) {
      return LayoutManager.prototype.render.call(view).then(function() {
        options.partial(root.el, name, view.el, append);
        view.delegateEvents();
      });
    };
    
    // Instance overrides take precedence, fallback to prototype options.
    options = view._options();

    // Set the prefix for a layout
    if (options.paths) {
      view._prefix = options.paths.template || "";
    }

    // Set the internal views
    if (options.views) {
      view.setViews(options.views);
    }

    // Special logic for appending items
    if (append) {
      partials = this.views[name] = this.views[name] || [];
      partials.push(view);

      return view;
    }

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

    // Wait until this View has rendered before dealing with nested Views.
    this._render(viewRender).then(function() {
      // Ensure element is removed from DOM before updating
      options.detach(root.el);

      // Create a list of promises to wait on until rendering is done. Since
      // this method will run on all children as well, its sufficient for a
      // full hierarchical. 
      var promises = _.map(root.hasOwnProperty("views") && root.views, function(view) {
        var def, views;

        // Ensure sequence views are rendered in order
        function seqRender(views, done) {
          if (!views.length) {
            return done();
          }

          var view = views.shift();

          view.render().then(function() {
            seqRender(views, done);
          });
        }

        if (_.isArray(view) && view.length) {
          views = _.clone(view);
          def = options.deferred();

          seqRender(views, function() {
            def.resolve();
          });

          return def.promise();
        }

        return view.render();
      });

      // Once all subViews have been rendered, resolve this View's deferred.
      options.when(promises).then(function() {
        viewDeferred.resolve();
      });
    });

    // Return a promise that resolves once all immediate subViews have
    // rendered.
    return viewDeferred.then(function(el) {
      root.delegateEvents();

      // Only call the done function if a callback was provided.
      if (_.isFunction(done)) {

        done(root.el);
      }
    }).promise();
  },

  _options: function() {
    // Instance overrides take precedence, fallback to prototype options.
    return _.extend({}, LayoutManager.prototype.options, this.options);
  }

},
{
  // Clearable cache
  _cache: {},

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
    if (_.isObject(opts)) {
      _.extend(LayoutManager.prototype.options, opts);
    }
  },

  makeAsync: function(options, done) {
    var handler = options.deferred();

    // Used to handle asynchronous renders
    handler.async = function() {
      handler._isAsync = true;

      return done;
    };

    return handler;
  }
});


// Attach to Backbone
Backbone.LayoutManager = LayoutManager;
Backbone.LayoutManager.View = LayoutManager;

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
  // string.
  fetch: function(path) {
    return _.template($(path).html());
  },

  // This is really the only way you will want to partially apply a view into
  // a layout.  Its entirely possible you'll want to do it differently, so
  // this method is available to change.
  partial: function(root, name, el, append) {
    var $root = $(root).find(name);
    this[append ? "append" : "html"]($root, el);
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

})(this.Backbone, this._, this.jQuery);



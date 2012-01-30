/*!
 * backbone.layoutmanager.js v0.2.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.layoutmanager.js may be freely distributed under the MIT license.
 */
(function(Backbone, _, $) {

"use strict";

var LayoutManager = Backbone.View.extend({

  // Allows the setting of multiple views instead of a single view.
  setViews: function(views) {
    // Iterate over all the views and use the View's view method to assign.
    _.each(views, function(view, name) {
      // Assign each view using the view function
      this.view(name, view);
    }, this);
  },

  view: function(name, view) {
    // This takes in a partial name and view instance and assigns them to
    // the internal collection of views.  If a view is not a LayoutManager
    // instance, then mix in the LayoutManager prototype.  This ensures
    // all Views can be used successfully.
    //
    // Must definitely wrap any render method passed in or defaults to a
    // typical render function `return layout(this).render()`.

    // Instance overrides take precedence, fallback to prototype options.
    var options = _.extend({}, LayoutManager.prototype.options, this.options);
  },

  // 
  render: function(done) {
    // By default this should find all nested views and render them into
    // the this.el and call done once all of them have successfully been
    // resolved.
    //
    // This function returns a promise that can be chained to determine
    // once all subviews and main view have been rendered into the view.el.

    // Instance overrides take precedence, fallback to prototype options.
    var view = this;
    var options = _.extend({}, LayoutManager.prototype.options, this.options);
    
    // Create a list of promises to wait on until rendering is done. Since
    // this method will run on all children as well, its sufficient for a
    // full hierarchical. 
    var promises = [];

    // Push this view's render on the promises array.
    promises.push(this._render());

    // Iterate over all views and push their promised rendering into the
    // list of promises.
    _.each(this.views, function(view) {
      promises.push(view._render());
    });

    // Return a promise that resolves once all immediate subViews have
    // rendered.
    return options.when(promises).then(function() {
      // Only call the done function if a callback was provided.
      if (_.isFunction(done)) {
        done(view.el);
      }
    });
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

  // Deprecated
  View: LayoutManager
});

// Attach to Backbone
Backbone.LayoutManager = LayoutManager;

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

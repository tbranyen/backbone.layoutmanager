var fs = require("fs");
var util = require("util");

var Backbone = require("backbone");
var _ = require("backbone/node_modules/underscore");
var def = require("underscore.deferred");
var $ = require("cheerio");

// Inspired by http://bit.ly/juSAWl
// Augment String.prototype to allow for easier formatting.  This implementation 
// doesn't completely destroy any existing String.prototype.format functions,
// and will stringify objects/arrays.
String.prototype.format = function(i, safe, arg) {

  function format() {
    var str = this, len = arguments.length+1;

    // For each {0} {1} {n...} replace with the argument in that position.  If 
    // the argument is an object or an array it will be stringified to JSON.
    for (i=0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
      str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
    }
    return str;
  }

  // Save a reference of what may already exist under the property native.  
  // Allows for doing something like: if("".format.native) { /* use native */ }
  format.native = String.prototype.format;

  // Replace the prototype property
  return format;

}();

// Hacky way to get layoutmanager to load with the correct globals
(function() {

  eval(fs.readFileSync(__dirname +
    "/../backbone.layoutmanager.js").toString());

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) {
      return null;
    }

    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Ensure Backbone doesn't ensureElement
  Backbone.View.prototype._ensureElement = function() {
    var attrs;

    if (!this.el) {
      attrs = getValue(this, "attributes") || {};

      if (this.id) {
        attrs.id = this.id;
      }

      if (this.className) {
        attrs["class"] = this.className;
      }

      this.setElement(this.make(this.tagName, attrs), false);
    } else {
      this.setElement(this.el, false);
    }
  };

  Backbone.View.prototype.make = function(tagName, attributes, content) {
    var el = $("<" + tagName + "/>");
    if (attributes) el.attr(attributes);
    if (content) el.html(content);
    return el;
  };


  Backbone.View.prototype.setElement = function(element, delegate) {
    this.$el = element;
    this.el = element[0];

    return this;
  };

  Backbone.LayoutManager.configure({

    deferred: function() {
      return def.Deferred();
    },

    fetch: function(path) {
      var done = this.async();

      fs.readFile("./" + path, function(err, contents) {
        done(_.template(contents.toString()));
      });
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
      var $root = root[0] ? root : $(root);
      $root.html(_.isString(el) ? el : $(el).html());
    },

    // Very similar to HTML except this one will appendChild.
    append: function(root, el) {
      var $root = root[0] ? root : $(root);
      $root.append(_.isString(el) ? el : $(el).html());
    },

    when: function(promises) {
      return def.when.apply(null, promises);
    },

  });

}).call(_.extend(global, { Backbone: Backbone, _: _ }));

module.exports = Backbone.LayoutManager;

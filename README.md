backbone.layoutmanager v0.4.0
=============================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen) with
[contributions](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

## Tutorials, Screencasts, & Examples ##

* [Initial Screencast](http://vimeo.com/32765088)
* Example Application: [Demo](http://dev.tbranyen.com/LayoutManager/) &
  [Source](http://github.com/tbranyen/layoutmanager-example)
* [Integrating with Backbone Boilerplate with Handlebars](https://github.com/tbranyen/boilerplate-handlebars-layoutmanager)

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

* [Development](https://raw.github.com/tbranyen/backbone.layoutmanager/master/backbone.layoutmanager.js)
* [Production](https://raw.github.com/tbranyen/backbone.layoutmanager/master/dist/backbone.layoutmanager.min.js)

Include in your application *after* jQuery, Underscore, and Backbone have been
included.

``` html
<script src="/js/jquery.js"></script>
<script src="/js/underscore.js"></script>
<script src="/js/backbone.js"></script>

<script src="/js/backbone.layoutmanager.js"></script>
```

## * Breaking Change In 0.4 * ##

The traditional way of inserting a Layout into the DOM was by way of:

``` javascript
// Create the Layout
var main = new Backbone.LayoutManager(...);

// Render the Layout
main.render(function(el) {
  // Attach Layout to the DOM
  $(".some-selector").html(el);
});
```

There were many visual and functional issues with this approach, mostly around
`jQuery.fn.html` not officially supporting an element argument.

If you wish to still use this approach ensure you: `$(el).detach()` before
using the `html` function.

The new *supported* way of inserting into the DOM is:

``` javascript
// Create the Layout
var main = new Backbone.LayoutManager(...);

// Attach Layout to the DOM
main.$el.appendTo(".some-selector");

// Render the Layout
main.render();
```

## Usage ##

This example renders a View into a template which is injected into a layout.

### Defining the layout and template ###

These example templates are defined using a common pattern which leverages
how browsers treat `<script></script>` tags with custom `type` attributes.

This is how LayoutManager expects templates to be defined by default (using
script tags).

#### Main Layout ####

``` plain
<script id="main-layout" type="layout">
  <section class="content twelve columns"></section>

  <!-- Template below will be injected here -->
  <aside class="secondary four columns"></aside>
</script>
```

#### Login Template ####

``` plain
<script id="login-template" type="template">
  <form class="login">
    <p><label for="user">Username</label><input type="text" name="user"></p>
    <p><label for="pass">Password</label><input type="text" name="pass"></p>
    <p><input class="loginBtn" type="submit" value="Login"></p>
  </form>
</script>
```

### Structuring a View ###

Each View can associate a template via the `template` property.  This name by
default is a jQuery selector, but if you have a custom configuration this could
potentially be a filename or JST function name.

*Note: If you do not specify a template LayoutManager will assume the View's
render method knows what it's doing and won't attempt to fetch/render anything
for you.*

``` javascript
var LoginView = Backbone.View.extend({
  // Tell LayoutManager what template to associate with this View.
  template: "#login-template",

  // The render function will be called internally by LayoutManager.
  render: function(manage) {
    // Have LayoutManager manage this View and call render.
    return manage(this).render();
  }
});
```

If you are planning on using the exact `render` method above, you can
simply omit it and the LayoutManager will add it for you.

``` javascript
var LoginView = Backbone.View.extend({
  template: "#login-template"
});
```

### Create and render a layout ###

Each LayoutManager can associate a template via the `template` property.  This
name by default is a jQuery selector, but if you have a custom configuration
this could potentially be a filename or JST function name.

**Never under any circumstances nest LayoutManagers.**  This is not a supported
API feature and it will cause infinite loops.  If you want to have sub layouts,
simply use a View as defined above and read on about nesting Views.

This code typically resides in a route callback.

``` javascript
// Create a new layout using the #main template.
var main = new Backbone.LayoutManager({
  // This is by default a selector to a template script in your page
  template: "#main-layout",

  // In the secondary column, put a new Login View.
  views: {
    ".secondary": new LoginView()
  }
});

// Attach the Layout to the <body></body>.
main.$el.appendTo("body");

// Render the Layout.
main.render();
```

Views may also be alternatively defined outside the LayoutManager:

#### Using the setViews function ####

This is identical to how views are being assigned in the example above.  It can
be used in the following way:


``` javascript
var main = new Backbone.LayoutManager({
  template: "#some-layout"
});

// Set the views outside of the layout
main.setViews({
  ".partial": new PartialView
});
```

#### Using the view function ####

Use the following function to change out views at a later time as well.
Remember to call the View's `render` method after swapping out to have it
displayed.  The view function's return value is the view, so chaining a return
is super simple.

``` javascript
main.view(".header", new HeaderView);
main.view(".footer", new FooterView);

// Chain a render method
main.view(".header", new HeaderView2).render();
```

The `view` function also has a special 3rd argument which is a boolean for
append.  If you set the third value to true it will automatically append the
View into the selector you provide.  *This is very useful for lists.*

Note: `view` and `setViews` methods are available on all layout and template
views.  This allows for nested Views, explained below.

### Nested Views ###

You may have a situation where a View is defined that encapsulates other nested
Views.  In these cases you should use nested views inside your LayoutManager
View assignments.

Check out this example to see how easy this is:

``` javascript
var main = new Backbone.LayoutManager({
  template: "#some-layout",

  views: {
    ".partial": new PartialView({
      views: {
        ".inner": new InnerView()
      }
    })
  }
});
```

Keep in mind that you can nest Views infinitely.

#### Re-rendering Views ####

Instead of re-rendering the entire layout after data in a single View changes,
you can simply call `render()` on the View and it will automatically update
the DOM.  You **cannot** bind to the initial render reference, like so:

*Assume that you have a model that when changed, causes a redraw.*

``` javascript
var MyView = Backbone.View.extend({
  initialize: function() {
    this.model.bind("change", this.render, this);
  }
});
```

You must use this syntax instead, calling it from a function:

``` javascript
var MyView = Backbone.View.extend({
  initialize: function() {
    this.model.bind("change", function() {
      this.render();
    }, this);
  }
});
```

The reasoning behind this, is that LayoutManager will automatically wrap your
render function internally and provide you with a much more convenient function
to re-render.

### Rendering repeating views ###

There are many times in which you will end up with a list of nested views
that result from either iterating a `Backbone.Collection` or `Array`
and will need to dynamically add these nested views into a main view.

LayoutManager solves this by exposing a method to change the insert mode
from replacing the `innerHTML` to `appendChild` instead.  Whenever you
use the `insert` method inside a render function you will put the
nested view into this special mode.

Sub views are always inserted in order, regardless if the `fetch` method has
been overwritten to be asynchronous.

An example will illustrate the pattern easier:

#### Item Template ####

This item template doesn't need to do much since it will be automatically
wrapped in an `<li></li>` by the View. 

``` plain
<script id="#item" type="template">
  <%= name %>
</script>
```

#### List Template ####

The list template simply needs to provide an outlet for the above `<li>` to be
appended into.  Setting up your View this way allows you to surround your list
with other content.

``` plain
<script id="#list" type="template">
  <ul></ul>
</script>
```

#### Item View ####

``` javascript
// You may find it easier to have Backbone render the LI/TD/etc element
// instead of including this in your template.  This is purely convention
// use what works for you.
var ItemView = Backbone.View.extend({
  template: "#item",

  // In this case we'll say the item is an <LI>
  tagName: "li"
});
```

#### List View ####

``` javascript
// You will need to override the `render` function with custom functionality.  
var ListView = Backbone.View.extend({
  template: "#list",

  render: function(manage) {
    // Have LayoutManager manage this View and call render.
    var view = manage(this);

    // Iterate over the passed collection and create a view for each item
    this.collection.each(function(model) {
      // Pass the data to the new SomeItem view
      view.insert("ul", new ItemView({
        serialize: { name: "Just testing!" }
      }));
    });

    // You still must return this view to render, works identical to
    // existing functionality.
    return view.render();
  }
});
```

#### Insert function ####

The `insert` function as seen above is simply a shortcut to the `view`
function, but automatically adds `true` to the append argument.

If you decide to omit the selector partial from `insert`, LayoutManager will
insert into the `View.el`.

For instance if you had a `<UL>` in your View and you wanted to insert into
that:

``` javascript
var ListView = Backbone.View.extend({
  render: function(manage) {
    var view = manage(this);

    // Append a new ItemView into the nested <UL>
    view.insert("ul", new ItemView);

    return view.render();
  }
});
```

If your View *is* a `<UL>` then you can simply do the following:

``` javascript
var ListView = Backbone.View.extend({
  // Ensure this View is a UL and not a DIV
  tagName: "ul",

  render: function(manage) {
    var view = manage(this);

    // Append a new ItemView to the View.el
    view.insert(new ItemView);

    return view.render();
  }
});
```

### Working with template data ###

Template engines bind data to a template.  The term context refers to the
data object passed.

LayoutManager will look for a `serialize` method or object automatically:

``` javascript
var LoginView = Backbone.View.extend({
  template: "#login-template",

  // Provide data to the template
  serialize: function() {
    return this.model.toJSON();
  }
});
```

You can also pass the context object inside the `render` method:

``` javascript
var LoginView = Backbone.View.extend({
  template: "#login-template",

  render: function(manage) {
    // Have LayoutManager manage this View and call render with data you
    // provide.
    return manage(this).render(this.model.toJSON());
  }
});
```

## Advanced View Concepts ##

Once you've mastered the above features, you will want to learn more about how
these methods actually work and how to integrate 3rd party plugins like jQuery
into your Views.

### Render function ###

The `render` function is overwritten on every `LayoutManager` and
`Backbone.View` instance.  The overwritten render saves a reference to the
custom function you provide and will call this internally whenever you invoke
`view.render()`.

``` javascript
var MyView = Backbone.View.extend({
  // This function gets wrapped by LayoutManager internally so you don't have
  // to pass any arguments to re-render.
  render: function(manage) {
    return manage(this).render();
  }
});
```

Every `render` function accepts an optional callback function that will return
the View element once it has rendered itself and all of its children.  The
`render` function returns a `promise` object that can be chained off of as
well.

``` javascript
// Using the callback method
new MyView().render(function(el) {
  // Use the DOMNode el here
});

// Using the promise resolve method
new MyView().render().then(function(el) {
  // Use the DOMNode el here
});
```

### Cleanup function ###

Every `Backbone.View` managed by LayoutManager can provide a custom `cleanup`
function that will run whenever the View is overwritten or removed.

``` javascript
var MyView = Backbone.View.extend({
  // This is a custom cleanup method that will remove the model reset event
  cleanup: function() {
    this.model.unbind("change");
  },

  initialize: function() {
    this.model.on("change", function() {
      this.render();
    }, this);
  }
});
```

*Note: Be careful with unbinding, you don't want to inadvertently remove events
from this model in other parts of your code.  These are shared objects.*

### Using jQuery Plugins ###

Attaching jQuery plugins should happen inside the `render` methods.  You can
attach at either the layout render or the view render.  To attach in the
layout render:

``` javascript
main.$el.appendTo(".container");

TODO: Ensure this section is correct...
main.render(function() {
  // Elements are guarenteed to be in the DOM
  main.$(".some-element").somePlugin();
});
```

When you render inside of a View, you will have only the guarentee that the
View and its SubViews have been rendered, but you do not have the guarentee
that they are inside the DOMDocument.  This could pose problems for some
plugins; if you notice problems attempt loading the plugin in the layout render
above.

To attach in the View render, you will need to override the `render` method
like so:

``` javascript
render: function(manage) {
  return manage(this).render().then(function(el) {
    $(el).find(".some-element").somePlugin();
  });
}
```

This is a very cool example of the power in using deferreds. =)

## Configuration ##

Overriding LayoutManager options has been designed to work just like
`Backbone.sync`.  You can override at a global level using
`LayoutManager.configure` or you can specify when instantiating a
`LayoutManager` instance.


### Global level ###

Lets say you wanted to use `Handlebars` for templating in all your Views.

``` javascript
Backbone.LayoutManager.configure({
  // Override render to use Handlebars
  render: function(template, context) {
    return Handlebars.compile(template)(context);
  }
});
```

### Instance level ###

In this specific layout, define custom prefixed paths for template paths.

``` javascript
var main = new Backbone.LayoutManager({
  template: "#main",

  // Custom paths for this layout
  paths: {
    template: "/assets/templates/"
  }
});
```

### Defaults ###

* __Paths__:
An empty object.  Two valid property names: `template` and `layout`.

``` javascript
paths: {}
```

* __Deferred__:
Uses jQuery deferreds for internal operation, this may be overridden to use
a different Promises/A compliant deferred.

``` javascript
deferred: function() {
  return $.Deferred();
}
```

* __Fetch__:
Uses jQuery to find a selector and returns its `innerHTML` content as a string
or template function (either works).

``` javascript
fetch: function(path) {
  return _.template($(path).html());
}
```

* __Partial__: 
Uses jQuery to find the View's location and inserts the rendered
element there.  The append property determines if the View should
append, defaults to replace via innerHTML.

``` javascript
partial: function(layout, name, template, append) {
  // If no selector is specified, assume the parent should be added to.
  var $root = name ? $(root).find(name) : $(root);

  // Use the append method if append argument is true.
  this[append ? "append" : "html"]($root, el);
}
```

* __HTML__:
Override this with a custom HTML method, passed a root element and an
element to replace the innerHTML with.

``` javascript
html: function(root, el) {
  $(root).html(el);
}
```

* __Append__:
Very similar to HTML except this one will appendChild.

``` javascript
append: function(root, el) {
  $(root).append(el);
}
```

* __Detach__:
Remove an element from the DOM, but maintain events.

``` javascript
detach: function(el) {
  $(el).detach();
}
```

* __When__:
This function will trigger callbacks based on the success/failure of one or
more deferred objects.

``` javascript
when: function(promises) {
  return $.when.apply(null, promises);
}
```

* __Render__:
Renders a template with the `Function` or `String` provided as the template
variable.

``` javascript
render: function(template, context) {
  return template(context);
}
```

### Asynchronous & Synchronous fetching ###

The `fetch` method is overridden to get the contents of layouts and templates.
If you can instantly get the contents (DOM/JST) you can return the
contents inside the function.

``` javascript
Backbone.LayoutManager.configure({
  fetch: function(name) {
    return $("script#" + name).html();
  }
});
```

If you need to fetch the contents asynchronously, you will need to put the
method into "asynchronous mode".  To do this, assign `this.async()`
to a variable and call that variable with the contents when you are done.

``` javascript
Backbone.LayoutManager.configure({
  fetch: function(name) {
    var done = this.async();

    $.get(name, function(contents) {
      done(contents);
    });
  }
});
```

## Sample Configurations ##

You may need to combine a mix of **Engines** and **Transports** to integrate.

### Engines (Mustache, Handlebars, etc.) ###

Custom templating engines can be used by overriding `render`.

#### Underscore ####

``` plain
No configuration necessary for this engine.
```

#### Mustache ####

``` javascript
Backbone.LayoutManager.configure({
  render: function(template, context) {
    return Mustache.to_html(template, context);
  }
});
```

#### Handlebars ####

``` javascript
Backbone.LayoutManager.configure({
  fetch: function (path){
    return Handlebars.compile($(path).html());
  },
  render: function(template, context) {
    return template(context);
  }
});
```

### Transports (DOM, AJAX, etc.) ###

You can swap out how templates are loaded by overriding `fetch`.

#### DOM ####

``` plain
No configuration necessary for this transport.
```

#### AJAX ####

``` javascript
Backbone.LayoutManager.configure({
  fetch: function(path) {
    var done = this.async();

    $.get(path, function(contents) {
      done(contents);
    });
  }
});
```

### Using an Engine and Transport Override for JST ###

Whatever you decide to return as a template in `fetch`, can be used in the
`render` method.

``` javascript
Backbone.LayoutManager.configure({
  fetch: function(name) {
    return window.JST[name];
  },

  render: function(template, context) {
    return template(context);
  }
});
```

## Release History ##

### 0.4.0 ###

* Detach no longer internally happens on the root Layout
* `manage` function inside a custom render has a new property `raw` for getting
  at the actual View instance
* Collection lists bugs solved
* Made `makeAsync` a private class method

### 0.3.0 ###

* Context is now consistent in either callbacks or deferreds
* `setViews` is now chainable
* `view` and `setViews` are now available at all times on `Backbone.View`'s
* Bug fixes regarding list duplication

### 0.2.1 ###

* Made `template` optional inside of `Backbone.View`
* Added custom cleanup function to handle the removal of any custom events
* insert no longer requires a selector
* Several performance improvements along with general stability changes

### 0.2.0 ###

* Major re-write to codebase that eliminated a lot of repetitive and cludgy
  code
* Deprecated the need to extend `Backbone.LayoutManager.View`
* All View `render` methods return promises and can accept a callback
* Views now render themselves first and then resolve/trigger the callback once
  all the children are rendered.  This helps with jQuery plugins.

### 0.1.2 ###

* Major patch for re-rendering layouts that would lose events
* Added new API method detach

### 0.1.1 ###

* Minor patch release (that removes an undocumented feature)
* Fixed issue with events not being registered correctly within lists

### 0.1.0 ###

* Lots of bug fixes!
* Ability to insert views dynamically using the new `view.insert` method.
  Useful for collections.
* Setting/resetting sub views possible with new `view.setViews` method.
* All views now have the `view/setViews` methods.
* Updates to allow LayoutManager to be extended easier, along with `events`
  being bound automatically during initialization.

### 0.0.4 ###

* Adding views turned into a reusable function called `view`.
* Templates no longer are required to be a string, this allows passing of
  compiled template functions.

### 0.0.3 ###

* View renders are internally wrapped to expose a new `render()` method that
  when called, re-renders.
* Nested views are possible by adding a `views` sub property which is an object
  that contains nested views.

### 0.0.2 ###

* Changed layout `name` property to `template` for consistency.
* Internal second deferred replaces the `viewDeferred` to determine when an
  element enters the DOM.

### 0.0.1 ###

* Open sourced on GitHub.
* Initial unit tests.
* Released introduction screencast.

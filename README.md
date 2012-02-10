backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen) with [contributions](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

## Tutorials, Screencasts, & Examples ##

* [Initial Screencast](http://vimeo.com/32765088)
* Example Application: [Demo](http://dev.tbranyen.com/LayoutManager/) & [Source](http://github.com/tbranyen/layoutmanager-example)

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

* [Development](https://raw.github.com/tbranyen/backbone.layoutmanager/master/backbone.layoutmanager.js)
* [Production](https://raw.github.com/tbranyen/backbone.layoutmanager/master/dist/backbone.layoutmanager.min.js)

Include in your application *after* jQuery, Underscore, and Backbone have been included.

``` html
<script src="/js/jquery.js"></script>
<script src="/js/underscore.js"></script>
<script src="/js/backbone.js"></script>

<script src="/js/backbone.layoutmanager.js"></script>
```

## Usage ##

This example renders a View into a template which is injected into a layout.

### Create and render a layout ###

This code typically resides in a route callback.  If you want to provide a
custom object for your template engine to the layout, use the `serialize`
property.

``` javascript
// Create a new layout using the #main template.
var main = new Backbone.LayoutManager({
  template: "#main-layout",

  // In the secondary column, put a new Login View.
  views: {
    ".secondary": new LoginView()
  }
});

// Render into <body>.
main.render(function(el) {
  $("body").html(el);
});
```

Views may also be alternatively defined later:

``` javascript
main.view(".header", new HeaderView);
main.view(".footer", new FooterView);
```

Use the above syntax to change out views at a later time as well, remember to
call the View's `render` method after swapping out to have it displayed.

The `view` method shown above is available on all layout and template views.

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

#### Alternative method of assigning nested views ####

You may be writing an application that uses a shared LayoutManager, you may
find the `setViews` method handy.  This is identical to how views are being
assigned above, it can be used in the following way:

Note: `setViews` is available on all layout and template views.

``` javascript
var main = new Backbone.LayoutManager({
  template: "#some-layout"
});

// Bulk reset of all sub views
main.setViews({
  ".partial": new PartialView({
    views: {
      ".inner": new InnerView()
    }
  })
});
```

### Structuring a View ###

Each View needs to have a template associated, via the `template` property.
This name by default is a jQuery selector, but if you have a custom
configuration this could potentially be a filename or JST function name.

``` javascript
var LoginView = Backbone.View.extend({
  // Tell LayoutManager what template to associate with this View.
  template: "#login-template",

  // The render function will be called internally by LayoutManager.
  render: function(layout) {
    // Wrap the layout with this View and call render.
    return layout(this).render();
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

#### Re-rendering Views ####

Instead of re-rendering the entire layout after data in a single View changes,
you can simply call `render()` on the View and it will automatically update
the DOM.  You **cannot** bind to the initial render reference, like so

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

This necessity may be alleviated in a future version.

#### Rendering consecutive views ####

There are many times in which you will end up with a list of nested views
that result from either iterating a `Backbone.Collection` or array
and will need to dynamically add these nested views into a main view.

LayoutManager solves this by exposing a method to change the insert mode
from replacing the `innerHTML` to `appendChild` instead.  Whenever you
use the `insert` method inside a render function you will put the
nested view into this special mode.

All sub views are inserted in order, regardless if the `fetch` method has
been overwritten to be asynchronous.

An example will illustrate the pattern easier:

``` javascript
// An example item View
// You may find it easier to have Backbone render the LI/TD/etc element
// instead of including this in your template.  This is purely convention
// use what works for you.
var SomeItem = Backbone.View.extend({
  template: "#item",

  // In this case we'll say the item is an <LI>
  tagName: "li"
});

// The view that contains the <ul> <table> w/e is used to contain your element.
// 
// Since this method is used inside a custom render method, LayoutManager.View
// isn't useful for rendering a collection list.
var SomeList = Backbone.View.extend({
  template: "#list",

  render: function(layout) {
    // Assign the layout view custom object to the view variable
    var view = layout(this);

    // Iterate over the passed collection and create a view for each item
    this.collection.each(function(model) {
      // Pass the model to the new SomeItem view
      view.insert("ul", new SomeItem({
        model: model
      }));
    });

    // You still must return this view to render, works identical to the
    // existing functionality.
    return view.render();
  }
});
```

#### Working with context ####

Template engines bind data to a template.  The term context refers to the
data object passed.

`LayoutManager` will look for a `serialize` method or object automatically:

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

  render: function(layout) {
    // Provide data to the template
    return layout(this).render(this.model.toJSON());
  }
});
```

### Defining the layout and template ###

These example templates are defined using a common pattern which leverages
how browsers treat `<script></script>` tags with custom `type` attributes.

This is how `LayoutManager` expects templates to be defined by default (using script tags).

#### Main layout ####

``` plain
<script id="main-layout" type="layout">
  <section class="content twelve columns"></section>

  <!-- Template below will be injected here -->
  <aside class="secondary four columns"></aside>
</script>
```

#### Login template ####

``` plain
<script id="login-template" type="template">
  <form class="login">
    <p><label for="user">Username</label><input type="text" name="user"></p>
    <p><label for="pass">Password</label><input type="text" name="pass"></p>
    <p><input class="loginBtn" type="submit" value="Login"></p>
  </form>
</script>
```

## Using jQuery Plugins ##

Attaching jQuery plugins should happen inside the `render` methods.  You can
attach at either the layout render or the view render.  To attach in the
layout render:

``` javascript
main.render(function(el) {
  $(el).find(".some-element").somePlugin();
  $(".container").html(el);
});
```

In the above example its entirely possible the elements are not in the DOM yet.
This happens when you fetch templates asynchronously.  Using the following
method, elements will be added into the DOM.  To attach in the layout render, 
you will need to override the `render` method like so:

``` javascript
render: function(layout) {
  return layout(this).render().then(function(el) {
    $(el).find(".some-element").somePlugin();
  });
}
```

This is a very cool example of the power in using deferreds. =)

## Configuration ##

Overriding `LayoutManager` options has been designed to work just like
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
Uses jQuery to find a selector and returns its `innerHTML` content.

``` javascript
fetch: function(path) {
  return $(path).html();
}
```

* __Partial__: 
Uses jQuery to find the View's location and inserts the rendered
element there.  The append property determines if the View should
append, defaults to replace via innerHTML.

``` javascript
partial: function(layout, name, template, append) {
  if (append) {
    this.append($(layout).find(name), template);
  } else {
    this.html($(layout).find(name), template);
  }
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

* __Render__:
Renders a template with Underscore.

``` javascript
render: function(template, context) {
  return _.template(template)(context);
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
  render: function(template, context) {
    return Handlebars.compile(template)(context);
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

### 0.2.0 ###

* Major re-write to codebase that eliminated a lot of repetitive and cludgy code
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
* Ability to insert views dynamically using the new `view.insert` method.  Useful for collections.
* Setting/resetting sub views possible with new `view.setViews` method.
* All views now have the `view/setViews` methods.
* Updates to allow LayoutManager to be extended easier, along with `events`
being bound automatically during initialization.

### 0.0.4 ###

* Adding views turned into a reusable function called `view`.
* Templates no longer are required to be a string, this allows passing of compiled template functions.

### 0.0.3 ###

* View renders are internally wrapped to expose a new `render()` method that when called, re-renders.
* Nested views are possible by adding a `views` sub property which is an object that contains nested views.

### 0.0.2 ###

* Changed layout `name` property to `template` for consistency.
* Internal second deferred replaces the `viewDeferred` to determine when an element enters the DOM.

### 0.0.1 ###

* Open sourced on GitHub.
* Initial unit tests.
* Released introduction screencast.

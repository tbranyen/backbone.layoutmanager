backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

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

[Screencast](http://tbranyen.com/post/announcing-backbonejs-layoutmanager)

### Create and render a layout ###

This code typically resides in a route callback.  If you want to provide a
custom object for your template engine to the layout, use the `serialize`
property.

``` javascript
// Create a new layout using the #main template.
var main = new Backbone.LayoutManager({
  name: "#main-layout",

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
main.views[".header"] = new HeaderView();
main.views[".footer"] = new FooterView();
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

Optionally, you can extend from `LayoutManager.View` and omit the `render`
method.  If you need to do custom logic in `render`, you should use the
other pattern above.

``` javascript
var LoginView = Backbone.LayoutManager.View.extend({
  template: "#login-template"
});
```

#### Working with context ####

Template engines bind data to a template.  The term context refers to the
data object passed.

`LayoutManager` will look for a `serialize` method or object automatically:

``` javascript
var LoginView = Backbone.LayoutManager.View.extend({
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
layout render, which happens in something like a route callback:

``` javascript
main.render(function(el) {
  $(el).find(".some-element").somePlugin();
  $(".container").html(el);
});
```

To attach in the layout render, you will need to override the `render` method
like so:

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
  name: "#main",

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
element there.

``` javascript
partial: function(layout, name, template) {
  $(layout).find(name).html(template);
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

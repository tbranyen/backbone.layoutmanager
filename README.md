backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

## Usage ##

This example renders a View into a template which is injected into a layout.

### Create and render a layout ###

This code typically resides in a route callback.

``` javascript
// Create a new layout using the #main template.
var main = new Backbone.LayoutManager({
  name: "#main-layout"
});

// In the secondary column, put a new Login View.
main.views[".secondary"] = new LoginView();

// Render into the container.
main.render(function(contents) {
  $(".container").html(contents);
});
```

### Structuring a View ###

Each View needs to have a template associated, via the `template` property.
This name by default is a jQuery selector, but if you have a custom
configuration this could potentially be a filename or JST function name.

``` javascript
var LoginView = Backbone.LayoutManager.View.extend({
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

### Defining the layout and template ###

#### Main layout ####

``` html
<script id="main-layout" type="layout">
  <section class="content twelve columns"></section>

  <!-- Template below will be injected here -->
  <aside class="secondary four columns"></aside>
</script>
```

#### Login template ####

``` html
<script id="login-template" type="template">
  <form class="login">
    <p><label for="user">Username</label><input type="text" name="user"></p>
    <p><label for="pass">Password</label><input type="text" name="pass"></p>
    <p><input class="loginBtn" type="submit" value="Login"></p>
  </form>
</script>
```

## Advanced Usage ##

### Defaults ###

__Paths__ An object that contains a `layout` and `template` properties.
These can be absolute or relative or ignored completely if not using
AJAX.

__Fetch__

__Partial__

__Render__

### Configuration ###

__Paths__

__Fetch__

__Partial__

__Render__

### Asynchronous/Synchronous operations ###

The `fetch` method is overriden to get the contents of layouts and templates.
If you can instantly get the contents (DOM/JST) you can simply return the
contents inside the function.

Example:

``` javascript
Backbone.configure({
  fetch: function(name) {
    return $("script#" + name).html();
  }
});
```

If you need to fetch the contents asynchronously, you will need to put the
method into "asynchronous mode".  To do this, simply assign `this.async()`
to a property and call that property when you are done.

Example:

``` javascript
Backbone.configure({
  fetch: function(name) {
    var done = this.async();

    $.get(name, function(contents) {
      done(contents);
    });
  }
});
```

## Sample Boilerplates ##

__Partial/Render__

* Underscore
* Mustache
* Handlebars

__Fetch__

* AJAX
* DOM
* JST

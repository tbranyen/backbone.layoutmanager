backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Provides a logical structure for assembling layouts within Backbone views.
Designed to be adaptive and configurable, `LayoutManager`, should work with
any templating implementation.

## Basic usage ##

### Templates

#### Example index.html ####

_/index.html_

``` html
<!DOCTYPE html>
<head>
  <meta charset=utf-8>
  <title>Example Application</title>
</head>

<body>
  <!-- Where layouts will be injected -->
  <div class="container"></div>

  <!-- Third party libraries -->
  <script src="/assets/js/libs/jquery.js"></script>
  <script src="/assets/js/libs/underscore.js"></script>
  <script src="/assets/js/libs/backbone.js"></script>
  <script src="/assets/js/libs/backbone.layoutmanager.js"></script>

  <!-- Application -->
  <script src="/assets/js/application.js"></script>

</body>
</html>
```

#### Example Main Layout ####

_/assets/templates/layouts/main.html_

``` html
<section class="content twelve columns"></section>
<aside class="secondary four columns"></aside>
```

#### Example Login Template ####

_/assets/templates/login.html_

``` html
<form class="login">
  <p><label for="user">Username</label><input type="text" name="user"></p>
  <p><label for="pass">Password</label><input type="text" name="pass"></p>
  <p><input class="loginBtn" type="submit" value="Login"></p>
</form>
```

### View

``` javascript
var LoginView = Backbone.View.extend({
  template: "/assets/templates/login.html",

  // The render function will be called internally by LayoutManager.
  // Do whatever you'd like inside this render method, but ensure to return
  // layout(this).render(/* Optional object for template engine */);
  render: function(layout) {
    return layout(this).render();
  }
});
```

### Route/Controller

``` javascript
var Router = Backbone.Router.extend({
  routes: {
    "": "home"
  },

  // When someone navigates to /
  home: function() {
    // Fetch the main.html layout
    var main = new Backbone.LayoutManager({
      name: "/assets/templates/layouts/main.html"
    });

    // In the secondary column, put a new Login View.
    main.partials[".secondary"] = new LoginView();

    // Contents is a DOM node that contains the layout.  In this example
    // it is being injected into the container DIV.
    main.render(function(contents) {
      $(".container").html(contents);
    });
  }
});
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

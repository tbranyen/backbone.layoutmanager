backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Attempts to simplify working with layouts and nested views within a layout.

## Example code ##

### Configure if overrides are desired ###

* paths   - Location of layout/templates
* fetch   - Fetch a layout/template
* partial - Apply a rendered sub view to the layout
* render  - Override to use custom engine syntax

``` javascript
// Configure for combyne.js
Backbone.LayoutManager.configure({
  paths: {
    layout: "/assets/templates/layouts/",
    template: "/assets/templates/"
  },

  render: function(template, context) {
    return combyne(template).render(context);
  }
});

```

### Writing the router logic ###

``` javascript
var Router = Backbone.Router.extend({
  routes: {
    "": "home"
  },

  // When someone navigates to /
  home: function() {
    // Fetch the main.html layout
    var main = new Backbone.LayoutManager({
      name: "main.html"
    });

    // In the left column put in a sub view
    main.partials[".left"] = new List.Views.Create();

    // Insert into the DOM
    main.render(function(contents) {
      $(".container").html(contents);
    });
  }
});
```

### Writing the view ###

* Specify the template
* Context object for the template
  + Automatically calls `serialize` method in view if it exists
  + Otherwise pass an object to `layout(this).render` within `render`.
* Events work exactly as you'd expect
  + Along with any View method, such as `remove`

``` javascript
List.Views.Create = Backbone.View.extend({
  template: "list/create.html",

  events: {
    "click button.create": "create"
  },
  
  create: function(evt) {
    lists.create(params, {
      success: function(list) {
        // ...
      }
    });
  },

  render: function(layout) {
    return layout(this).render(this.toJSON());
  }
});
```

### Creating the layout ###

__layouts/main.html__

``` html
<header class="sixteen columns"></header>

<div class="one-third column left">
  <!-- list/create.html will be rendered in here -->
</div>

<div class="two-third column right"></div>
```

__templates/list/create.html__

``` html
<h3>New</h3>
<form>
  <button class="create">Create</button>
</form>
```

__index.html__

``` html
<!DOCTYPE html>
<head>
  <meta charset=utf-8>
  <meta http-equiv=X-UA-Compatible content=IE=edge,chrome=1>
  <title>backbone.layoutmanager</title>
</head>

<body>

  <div class="container"></div>

  <!-- Third party libraries -->
  <script src="/assets/js/libs/jquery.js"></script>
  <script src="/assets/js/libs/underscore.js"></script>
  <script src="/assets/js/libs/backbone.js"></script>
  <script src="/assets/js/libs/backbone.layoutmanager.js"></script>
  <script src="/assets/js/libs/combyne.js"></script>

  <!-- Library application -->
  <script src="/lib/application.js"></script>

  <!-- Modules -->
  <script src="/lib/modules/list.js"></script>

</body>
</html>
```

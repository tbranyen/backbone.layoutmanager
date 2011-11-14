backbone.layoutmanager
=======================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Attempts to simplify working with layouts and nested views within a layout.

# Example code #

## Configure if overrides are desired ##

* engine - Determines which template engine to use
* render - Override to use custom engine syntax
* partial - Apply a rendered sub view to the layout
* fetch - Fetch a layout/template
* paths - Location of layout/templates

``` javascript
// Configure for combyne.js
Backbone.LayoutManager.configure({
  engine: combyne,
  
  render: function(template, context) {
    return this.options.engine(template).render(context);
  },

  paths: {
    layout: "/assets/templates/layouts/",
    template: "/assets/templates/"
  }
});

```

## Writing the router logic ##

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

## Writing the view ##

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

## TBD ##

* Better documentation
* Code clean up
* Implementations for popular transports and engines
  + Such as in DOM `<script type="text/template">`
  + Compiled templates

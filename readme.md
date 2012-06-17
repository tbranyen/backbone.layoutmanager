backbone.layoutmanager v0.5.2
=============================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen) with
[contributions](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

## Tutorials, Screencasts, & Examples ##

* [Initial Screencast](http://vimeo.com/32765088)
* Example Application: [GitHub Viewer](http://githubviewer.org) &
  [Source](http://github.com/tbranyen/github-viewer)
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

## Usage ##

This example renders a View into a template which is injected into a layout.

### Defining the layout and template ###

These example templates are defined using a common pattern which leverages how
browsers ignore `<script></script>` contents when using a custom `type`
attribute.

*Note: This is how LayoutManager expects templates to be defined by default
(using script tags).*

#### Main Layout ####

``` plain
<script id="main-layout" type="layout">
  <section class="content"></section>

  <!-- Login template below will be injected here -->
  <aside class="secondary"></aside>
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
  template: "#login-template",

  // The render function will be called internally by LayoutManager.
  render: function(manage) {
    // Have LayoutManager manage this View and call render.
    return manage(this).render();
  }
});
```

If you are using the default `render` method above, you can simply omit it and
LayoutManager will add it for you.

``` javascript
var LoginView = Backbone.View.extend({
  template: "#login-template"
});
```

### Create and render a layout ###

Each LayoutManager can associate a template via the `template` property.  This
name by default is a jQuery selector, but if you have a custom configuration
this could potentially be a filename or JST function name.

*Note: Nesting LayoutManagers is not supported.  If you want sub layouts,
simply read on about nesting Views.*

This code typically resides in a route callback.

``` javascript
var main = new Backbone.LayoutManager({
  template: "#main-layout",

  // In the secondary column, put a new Login View.
  views: {
    ".secondary": new LoginView()
  }
});

// Attach the Layout to the <body></body>.
$("body").html(main.el);

// Render the Layout.
main.render();
```

### Adding a layout to the DOM ###

To add a layout into the page, simply inject it into a container at the time of
creation.  Do **not** call `html` more than once for a layout element, unless
you detach it first.  This is not recommended as it may cause a flicker during
re-rendering.  It's cleaner and more efficient to only create a layout when
you need it and insert into the DOM at that time.

``` javascript
// Create the Layout.
var main = new Backbone.LayoutManager(...);

// Attach Layout to the DOM.
$(".some-selector").html(main.el);

// Optional: (Not recommeded) Detach first if you cache the layout
// main.$el.detach();

// Render the Layout.
main.render();
```

Views may also be alternatively defined outside the LayoutManager:

#### Using the setView function ####

Use the following function to change out views at a later time.  Remember to
call the View's `render` method after swapping out to have it displayed.  The
`setView` return value is the view, so chaining a `render` is super simple.

``` javascript
main.setView(".header", new HeaderView());
main.setView(".footer", new FooterView());

// Chain a render method
main.setView(".header", new HeaderView2()).render();
```

*Note: `setView` and `setViews` methods are available on all views.  This
allows for nested Views, explained below.*

*Note: The first argument *selector* can be omitted completely if you would
like the nested View to exist directly on the element.  This works well when
your parent View is something like a `UL` and your nested View is an `LI`.*

*Note: The third argument is optional, but when set to `true` it will
automatically append the View into the container instead of replacing the
content.*

#### Using the setViews function ####

This is identical to how views are being assigned in the Layout example.  It
can be used in the following way:


``` javascript
var main = new Backbone.LayoutManager({
  template: "#some-layout"
});

// Set the views outside of the layout
main.setViews({
  ".partial": new PartialView()
});
```

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

*Note: You can nest Views infinitely.*

#### Re-rendering Views ####

Instead of re-rendering the entire layout after data in a single View changes,
you can simply call `render()` on the View and it will automatically update
the DOM.

*This syntax is completely valid*

``` javascript
var MyView = Backbone.View.extend({
  initialize: function() {
    this.model.on("change", this.render, this);
  }
});
```

*As well as this syntax*

``` javascript
var MyView = Backbone.View.extend({
  initialize: function() {
    this.model.on("change", function() {
      this.render();
    }, this);
  }
});
```

### Rendering repeating views ###

There are many times in which you will end up with a list of nested views
that result from either iterating a `Backbone.Collection` or `Array`
and will need to dynamically add these nested views into a main view.

LayoutManager solves this by exposing a method to change the insert mode
from replacing the `innerHTML` to `appendChild` instead.  Whenever you
use the `insertView` method you will put the nested view into this special
mode.

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

The list View simply needs to provide an outlet for the above `<li>` to be
appended into.

``` javascript
// You will need to override the `render` function with custom functionality.  
var ListView = Backbone.View.extend({
  tagName: "ul"

  render: function(manage) {
    // Iterate over the passed collection and create a view for each item.
    this.collection.each(function(model) {
      // Pass the sample data to the new SomeItem View.
      this.insertView(new ItemView({
        serialize: { name: "Just testing!" }
      }));
    }, this);

    // You still must return this view to render, works identical to
    // existing functionality.
    return manage(this).render();
  }
});
```

### How does this not duplicate Views? ###

Internally LayoutManager will remove all View's marked as in *append* mode.
This is any View contained in an array via `setView` or `insertView`.  This
allows View's like ListView above to work without duplicating list items.

If you wanted to keep a View from being removed pre-render, for instance,
keeping a history of items in the DOM or you're just adding new stuff every
render you will need to flag the View to be retained.

``` javascript
var ItemView = Backbone.View.extend({
  template: "#item",

  // In this case we'll say the item is an <LI>
  tagName: "li",

  // This will keep the View from being automatically removed by LayoutManager.
  keep: true
});
```

### insertView function ###

The `insertView` function as seen above is simply a shortcut to the `setView`
function, but automatically adds `true` to the append argument.

If you decide to add the selector partial to `insertView`, LayoutManager
will insert into the specified element.

For instance if you had a `<UL>` in your View and you wanted to insert into
that:

``` javascript
var ListView = Backbone.View.extend({
  render: function(manage) {
    // Append a new ItemView into the nested <UL>
    this.insertView("ul", new ItemView());

    return manage(this).render();
  }
});
```

If your View *is* a `<UL>` then you can simply do the following:

``` javascript
var ListView = Backbone.View.extend({
  // Ensure this View is a UL and not a DIV
  tagName: "ul",

  render: function(manage) {
    // Append a new ItemView to the View.el
    this.insertView(new ItemView());

    return manage(this).render();
  }
});
```

If you wish to change `append` to `prepend` you can easily change how the
View is inserted by setting a new `append` function.

``` javascript
var ListView = Backbone.View.extend({
  render: function(manage) {
    // Append a new ItemView into the nested <UL>.
    this.insertView("ul", new ItemView({
      // Prepend the element instead of append.
      append: function(root, child) {
        $(root).prepend(child);
      }
    }));

    return manage(this).render();
  }
});
```

*Note `insertView` can be used outside of `render` and is especially useful
for when you have an `add` event off a Collection.*

#### insertViews function ####

The `insertViews` function is identical to `insertView` except that you can
bulk append like with `setViews`.  You can one or more items by using an array.

``` javascript
var ListView = Backbone.View.extend({
  render: function(manage) {
    // Append a new ItemView into the nested <UL>.
    this.insertViews({
      // Append a single item.
      "div": new ItemView(),

      // Append multiple items.
      "ul": [new ItemView(), new ItemView()]
    });

    return manage(this).render();
  }
});
```
### getView function ###

The `getView` function allows you to find a specific View by some filter
function.

``` javascript
// Find an remove a View if it has the exact Model.
main.getView(function(view) {
  return view.model === someModel;
}).remove();
```

#### getViews function ####

This function works very similar to the `getView` function, except that it will
always return an `Array` of matching View's.  If you omit the filter function,
it will return all subViews flattened.

``` javascript
// Find all sub views flattened in an Array.
main.getViews()

// Find all sub views that have a model.
main.getViews(function(view) {
  return view.model;
});
```

### removeView function ###

The `removeView` function is available on all View's and should be called in
place of `remove` when applicable.  It's mainly used internally, but if you
find that you need to scrub and remove a View and all its subView's you can use
this.

``` javascript
// Will remove the View and all subViews.
main.removeView();

// Will remove only append-mode (lists) items.
main.removeView(true);
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
attach at either the Layout render or the View render.  To attach in the
layout render:

``` javascript
$(".container").html(main.el);

main.render(function() {
  // Elements are guarenteed to be in the DOM
  this.$(".some-element").somePlugin();
});
```

To attach in the View render, you will need to override the `render` method
like so:

``` javascript
render: function(manage) {
  return manage(this).render().then(function() {
    this.$(".some-element").somePlugin();
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
partial: function(root, name, el, append) {
  // If no selector is specified, assume the parent should be added to.
  var $root = name ? $(root).find(name) : $(root);

  // If no root found, return false
  if (!$root.length) {
    return false;
  }

  // Use the append method if append argument is true.
  this[append ? "append" : "html"]($root, el);

  // If successfully added, return true
  return true;
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

## Release notes ##

### 0.5.2 ###

* More methods can be overwritten from initialization
* Render can now be bound like `this.collection.on("reset", this.render, this);`
* Fixes to `keep: true` and append example, only checking `keep` if View has
  already rendered

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

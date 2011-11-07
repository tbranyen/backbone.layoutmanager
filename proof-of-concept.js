// Global configuration, may be overidden, configure will, under the hood, mix
// into the prototype.  If you use configure within extending it will mix into
// the instance.
Backbone.LayoutManager.configure({
  // Specify the engine to use, should be a reference type, function/object/etc.
  engine: _.template,

  // Add in a compile step that will be called automatically, when template is
  // fetched.
  compile: function(contents) {
    return this.engine(contents);
  },

  // Handling partials
  partial: function(name, template) {
    $(name).html(template);
  },

  // Fetch the template, interally uses AJAX
  fetch: function(path) {
    return $(path);
  },

  // If using AJAX, you can have routes automatically prefixed
  // Override to localize to a view
  paths: {
    layout: "/assets/templates/layouts/",
    template: "/assets/templates/"
  }
});

// Configure on a per layout basis, mixes into the instance
// Backbone.LayoutManager internally extends from Backbone.View
var Partial = Backbone.LayoutManager.extend({
  configure: {
  }
});

// Implement with LayoutManager
var ListView = Partial.extend({
  // Localize template path, to this generic modules folder
  paths: {
    template: "/app/module/templates"
  },

  // LayoutManager internally looks for this function automatically,
  // to pass data to the template engine.
  serialize: function() {
    return [1, 2, 3, 4, 5];
  }
});

// Secondary view without LayoutManager
// very little work needed to get going.
var MainView = Backbone.View.extend({
  // This is optional, using a serialize function to maintain consistency
  serialize: function() {
    return {};
  },

  // Define template here
  template: "main",

  // Very simple to implement here
  render: function(layout) {
    // Defer to the LayoutManager to marry the template to the view with
    // the context object passed into the render method.
    // return layout(this).render(this.serialize());

    // Omission of a context object defers to the serialize function.
    // So this would be functionally equivalent to the return statement above.
    return layout(this).render();
  }
});

// Use in a router
var Router = Backbone.Router.extend({
  routes: {
    "": "main"
  },

  main: function() {
    // Create a new Element instance of the layout, DIV by default just like
    // Backbone, with an identical matching tagName to create a custom type.
    var baseLayout = new Backbone.LayoutManager("base", {
      tagName: "section"

      // Add partials mapping so this template knows where to be injected,
      // if you aren't using a DOM approach, this name can be whatever
      // the engine is expecting.
      partials: {
        "#list": new ListView({ template: "list" })
      }
    });

    // MainView already knows what template to use since we defined it in the
    // definition.
    var mainView = new MainView();

    // Attach a partial view outside of the initializer
    baseLayout.partials["#main"] = mainView;

    // Insert into the DOM
    baseLayout.render( $("#container").html );
  }
});

// Trigger route
(new Router()).navigate("");

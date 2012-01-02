module("views", {
  setup: function() {
    // Custom View
    this.View = Backbone.LayoutManager.View.extend({
      template: "#test",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts.msg;
      }
    });

    this.SubView = Backbone.LayoutManager.View.extend({
      template: "#test-sub",

      serialize: function() {
        return { text: this.msg };
      },

      initialize: function(opts) {
        this.msg = opts && opts.msg || "Right";
      }
    });
  }
});

asyncTest("render outside defined partial", function() {
  var main = new Backbone.LayoutManager({
    template: "#main"
  });

  main.view(".right", new this.View({ msg: "Right" }));

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-left").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("render inside defined partial", function() {
  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View({ msg: "Right" })
    }
  });

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-left").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});

asyncTest("re-render a view defined after initialization", function(){
  var main = new Backbone.LayoutManager({
    template: "#main"
  }), trimmed;

  main.view(".right", new this.View({ msg: "Right" }));

  main.render(function(contents) {
    $('#container').html(contents);
    start();
  });
  
  main.views[".right"].render();
  trimmed = $.trim( $("#container .inner-left").html() );
  equal(trimmed, "Right", "Correct re-render");
  
  main.view(".right", new this.View({ msg: "Right Again" })).render();
  trimmed = $.trim( $("#container .inner-left").html() );
  equal(trimmed, "Right Again", "Correct re-render");
})

asyncTest("nested views", function() {
  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View({
        msg: "Left",

        views: {
          ".inner-right": new this.SubView()
        }
      })
    }
  });

  main.render(function(contents) {
    var trimmed = $.trim( $(contents).find(".inner-right div").html() );

    ok(contents instanceof Element, "Contents is a DOM Node");
    equal(trimmed, "Right", "Correct render");

    start();
  });
});


asyncTest("nested views re-rendering", function() {
  var main = new Backbone.LayoutManager({
    template: "#main",

    views: {
      ".right": new this.View({
        msg: "Left",

        views: {
          ".inner-right": new this.SubView()
        }
      })
    }
  }), trimmed;

  main.render(function(contents) {
    $('#container').html(contents);
    start();
  });

  trimmed = $.trim( $("#container .inner-right div").html() );
  equal(trimmed, "Right", "Correct render");
  
  main.view('.right', new this.View({
    msg: "Left",

    views: {
      ".inner-right": new this.SubView({msg: 'Right Again'})
    }
  })).render();
  
  trimmed = $.trim( $("#container .inner-right div").html() );
  equal(trimmed, "Right Again", "Correct render");
  
  
  // Making sure that the nested view 
  main.views['.right'].render();
  
  trimmed = $.trim( $("#container .inner-right div").html() );
  equal(trimmed, "Right Again", "Correct render");
});

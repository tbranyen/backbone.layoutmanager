backbone.layoutmanager v0.7.0
=============================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), with help
from [awesome contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.  Well tested,
with over 120 assertions and 100% code coverage!

Tested with Underscore, Backbone and jQuery. You can swap out jQuery with a
custom configuration or substitute Underscore with Lo-Dash.

## Documentation ##

Refer to: http://tbranyen.github.com/backbone.layoutmanager/

Migration guide: https://github.com/tbranyen/backbone.layoutmanager/pull/184

## Release notes ##

### 0.7.0 ###

* Refactored source to be less cryptic.
* 100% test code coverage.
* Re-wrote much of the internals.
* Performance greatly improved, especially with large lists.
* Removed `swapLayout`.
* `serialize` is deprecated and replaced by `data`.
* `render(callback)` is deprecated to `render().done()` deferreds only.
* Automatically unbind `model` and `collection` events inside `cleanup`.
* `Backbone.LayoutView, `Backbone.Layout`, and `Backbone.View` (with `manage`
  set to `true`) are now all identical.
* `paths` is now a String `prefix`, set this to the folder where your templates live.
* `myView.render().view` now allows you to attach `view.el` after a render for
  some nice one-liners.
   `
new Backbone.LayoutView({ template: "#t" }).render().view.$el.appendTo("body");
`

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

backbone.layoutmanager v0.7.0
=============================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), with help
from [awesome contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.  Well tested,
with over 120 assertions and 100% code coverage!

Depends on Underscore, Backbone and jQuery, but you can swap out the
dependencies with a custom configuration.

## Release notes ##

### 0.7.0 ###

* Refactored source to be less cryptic.
* 100% test code coverage.
* Re-wrote much of the internals.
* Performance greatly improved, especially with large lists.
* Removed `swapLayout`.
* `serialize` is deprecated in favor of `data`.
* `render` callback removed in favor of deferreds.
* `Backbone.LayoutView, `Backbone.Layout`, and `Backbone.View` (with `manage`
  set to `true`) are now all identical.
* `paths` is now a `prefix`, set this to the folder where your templates live.

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

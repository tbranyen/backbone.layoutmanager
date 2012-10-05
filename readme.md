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
* Added 100% code coverage.
* Re-wrote much of the internals.
* Removed `swapLayout`.
* `serialize` is deprecated in favor of `data`.
* `render` callback removed in favor of deferreds.

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

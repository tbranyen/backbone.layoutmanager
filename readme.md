backbone.layoutmanager v0.7.1
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

### 0.7.1 ###

* Views that have already been rendered can now be inserted into existing Views.
* Fixed the logic that decides when to remove Views.
* Fixed issue with `cleanup` not being on nested Views.
* Miscellaneous fixes (inc. null checks, perf. updates, etc).
* Removed minified build file from the repo.
* `insertViews` can now accept an array of Views.
* `render` can now be asynchronous to allow template engines like dust.js to
  work seamlessly, works identical to `fetch`.
* Overriding the template option at initialization level wil now override the
  constructor option.

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

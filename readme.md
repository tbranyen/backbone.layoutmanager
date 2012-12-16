Backbone.LayoutManager
======================

**v0.8.0-pre** [![Build Status](https://secure.travis-ci.org/tbranyen/backbone.layoutmanager.png?branch=master)](http://travis-ci.org/tbranyen/backbone.layoutmanager)

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), with help
from [awesome contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical structure for assembling layouts with Backbone Views.
Designed to be adaptive and configurable for painless integration.  Well
tested, with over 140 assertions and 100% code coverage!

Tested with Underscore & Lo-Dash, Backbone and jQuery. You can swap out jQuery
with a custom configuration or substitute Underscore with Lo-Dash.

## Migrating from 0.7 ##



## Documentation ##

http://layoutmanager.org/

## Release notes ##

* Refactored `_.extend` to `LayoutManager.augment` to work with Lo-Dash and
  underscore.
* Normalized rendering order, when the parent has already rendered.
* Added better error handling for node.js build.
* Updated error message for node.js build.
* Added in Travis-CI and README updates.

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

## Donate ##

I do my very best to ensure top quality and continued progress with
LayoutManager.  Developers using, but not contributing, may want to consider
leaving a small donation to show their appreciation.

All funds collected will find their way to the [mspca](http://www.mspca.org/) organization.  Thanks! :)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2Q5RWXT7SSSFG)

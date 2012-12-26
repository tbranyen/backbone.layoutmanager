Backbone.LayoutManager
======================

**v0.8.0-pre** [![Build Status](https://secure.travis-ci.org/tbranyen/backbone.layoutmanager.png?branch=master)](http://travis-ci.org/tbranyen/backbone.layoutmanager)

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), with help
from [awesome contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)

Provides a logical foundation for assembling layouts and views within Backbone.
Designed to be adaptive and configurable for painless integration.  Well
tested, with full code coverage, in both the browser and Node.js environments.

Depends on Underscore, Backbone, and jQuery.  You can swap out the dependencies
with a custom configuration.

## Migrating from 0.7 ##

* Rename all instances of `Backbone.LayoutManager` and `Backbone.LayoutView` to
  `Backbone.Layout`.
* Rename all instances of `data` to `serialize`.
* Rename any custom `append` functions to `insert`.
* Upgrade your application to Backbone 0.9.9 and at least Underscore 1.4.2.
* Lo-Dash is no longer supported, use the lodash.underscore build instead.

## Documentation ##

http://layoutmanager.org/

## Release notes ##

* Updated `getView` to have an `undefined` first argument to be passed allowing
  for an optional selector.
* Removed all aliases to `LayoutManager`.  Now only `Backbone.Layout` and
  `Backbone.View`.
* Added a `removeView` function to match `setView`, `getView`, etc.
* Removed `LayoutManager` and `LayoutView` aliases.
* Removed `data` alias in favor of `serialize`.
* Removed `append` alias in favor of `insert`.
* The `getView` function can receive a **where** object now, to easily filter
  through the Views.
* Upgraded minimum support to Backbone 0.9.9, which will invoke `stopListening`
  automatically for you.
* Internally implemented once to solve `afterRender` woes.
* Added Backbone event bubbling from nested Views to parent.
* Massive Node.js refactor, including: unit testing, significantly better
  browser parity, and allowing more seamless browser/server View sharing.

[Full Release Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

## Donate ##

I do my very best to ensure top quality and continued progress with
LayoutManager.  Developers using, but not contributing, may want to consider
leaving a small donation to show their appreciation.

All funds collected will find their way to the [mspca](http://www.mspca.org/) organization.  Thanks! :)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2Q5RWXT7SSSFG)

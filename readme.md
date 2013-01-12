Backbone.LayoutManager
======================

**v0.8.0** [![Build
Status](https://travis-ci.org/tbranyen/backbone.layoutmanager.png?branch=wip)](https://travis-ci.org/tbranyen/backbone.layoutmanager)

Maintained by Tim Branyen [@tbranyen](http://twitter.com/tbranyen) and Mike
Pennisi [@jugglinmike](http://twitter.com/jugglinmike), with help from [awesome
contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)!

Provides a logical foundation for assembling layouts and views within Backbone.
Designed to be adaptive and configurable for painless integration.  Well
tested, with full code coverage, in both the browser and Node.js environments.

Depends on Underscore, Backbone, and jQuery.  You can swap out the dependencies
with a custom configuration.

## Documentation ##

http://layoutmanager.org/

## Migrating from 0.7 ##

http://layoutmanager.org/From-0.7-to-0.8

## Release notes ##

* Massive Node.js refactor, including: unit testing, significantly better
  browser parity, and allowing more seamless browser/server View sharing.
* Ability to disable `Backbone.View#el` wrapper element using `el: false` and
  opt for the first child inside the template instead.
* Added Backbone event bubbling from nested Views to parent.
* The `getView` function can receive a `_.where` object now, to easily filter
  through the Views.
* Updated `getView` to have an `undefined` first argument to be passed allowing
  for an optional selector.
* Changed Grunt configuration from JavaScript to CoffeeScript.
* Added a `removeView` function to match `setView`, `getView`, etc.
* Removed `LayoutManager` and `LayoutView` aliases.
* Removed `data` alias in favor of `serialize`.
* Removed `append` alias in favor of `insert`.
* Renamed `_options` to `getAllOptions` making it an endorsed method to use.
* Upgraded minimum support to Backbone 0.9.9, which will invoke `stopListening`
  automatically for you.
* Internally using `Backbone.Events#once` to solve `afterRender` woes.
* Class method `cache` now allows you to override contents.
* Class method `setupViews` now allows you to manage many Views by passing an
  array of Views.
* Miscellaneous code cleanup and minor bug/refactor fixes.

[Full Release
Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/changelog.md)

## Contributing ##

Please read and follow the [contribution
guide](https://github.com/tbranyen/backbone.layoutmanager/blob/master/contributing.md)
before contributing.

**Running the unit tests in the browser**

Open `test/index.html` in your favorite browser to ensure LayoutManager works
as expected.

**Running the unit tests headless**

Install [Node.js](http://nodejs.org), [Grunt.js 0.4](http://gruntjs.com), and
run `npm install` inside the project directory.

Make sure you've installed `grunt-cli` globally with:

``` bash
[sudo] npm install grunt-cli -g
```

Run `grunt` inside a terminal in the project directory to run the tests in both
a headless browser and Node.js environment.

## Donate ##

I do my very best to ensure top quality and continued progress with
LayoutManager.  Developers using, but not contributing, may want to consider
leaving a small donation to show their appreciation.

All funds collected will find their way to the [mspca](http://www.mspca.org/)
organization.  Thanks! :)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2Q5RWXT7SSSFG)

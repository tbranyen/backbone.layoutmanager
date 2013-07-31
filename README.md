LayoutManager
=============

**v0.9.0** [![Build
Status](https://travis-ci.org/tbranyen/backbone.layoutmanager.png?branch=master)](https://travis-ci.org/tbranyen/backbone.layoutmanager)
[![Dependency Status](https://gemnasium.com/tbranyen/backbone.layoutmanager.png)](https://gemnasium.com/tbranyen/backbone.layoutmanager)

Maintained by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), Mike
Pennisi [@jugglinmike](http://twitter.com/jugglinmike), Simon Boudrias
[@SBoudrias](http://twitter.com/Vaxilart), and [@ssafejava](https://github.com/ssafejava) with help from
[awesome
contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)!

Provides a logical foundation for assembling layouts and views within Backbone.
Designed to be adaptive and configurable for painless integration.  Well
tested, with full code coverage, in both the browser and Node.js environments.

Depends on Underscore, Backbone, and jQuery.  You can swap out the dependencies
with a custom configuration.

## Documentation ##

http://layoutmanager.org/

## Migrating from 0.8 ##

http://layoutmanager.org/From-0.8-to-0.9

## Release notes ##

* Upgraded all internal dependencies.
* Batch rendering via jQuery collections has been added.  Check out the
  `htmlBatch` method.
* Full on AMD support.  No more shimming necessary!
* `render` now returns the View instance to maintain parity with other
  `Backbone.View` tutorials and plugins.
* `fetch` and `render` overrides have been renamed to `fetchTemplate` and
  `renderTemplate` respectively.
* New method `renderViews` which will only render nested Views and not the
  parent view, useful for top level layouts.
* Event bubbling has been removed.
* Named regions for selectors using the `section` object.
* Greatly refactored how the `async()` methods work.  This allows every method
  of the `render` lifecycle to be asynchronous and maintain the context of the
  View.

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

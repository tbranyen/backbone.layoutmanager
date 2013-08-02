LayoutManager
=============

**v0.9.1** [![Build
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

* Fixed regression from 0.8->0.9 where the new AMD wrapper would fail to work
  correctly in an r.js build.
* Fixed regression from 0.8->0.9 where the Node.js branch code was not updated
  correctly and lack of default `fetchTemplate` tests didn't report the
  failure.

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

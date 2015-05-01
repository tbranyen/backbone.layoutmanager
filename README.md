LayoutManager
-------------

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code coverage][coveralls-image]][coveralls-url]

## Have a problem? Come chat with us! ##

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tbranyen/backbone.layoutmanager?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Maintained by Tim Branyen [@tbranyen](http://twitter.com/tbranyen), Mike
Pennisi [@jugglinmike](http://twitter.com/jugglinmike), Simon Boudrias
[@SBoudrias](http://twitter.com/Vaxilart), and
[@ssafejava](https://github.com/ssafejava) with help from [awesome
contributors](https://github.com/tbranyen/backbone.layoutmanager/contributors)!

Provides a logical foundation for assembling layouts and views within Backbone.
Designed to be adaptive and configurable for painless integration.  Well
tested, with full code coverage, in both the browser and Node.js environments.

Depends on Underscore, Backbone, and jQuery.  You can swap out the dependencies
with a custom configuration.

#### Documentation ####

http://layoutmanager.org/

#### Migrating from 0.8 ####

http://layoutmanager.org/From-0.8-to-0.9

#### Release notes ####

* Adds in a `cleanup` event whenever a view has been removed
* Fully support & test against LoDash 3.0 and Underscore

[Full Release
Log](https://github.com/tbranyen/backbone.layoutmanager/blob/master/CHANGELOG.md)

#### Contributing ####

Please read and follow the [contribution
guide](https://github.com/tbranyen/backbone.layoutmanager/blob/master/CONTRIBUTING.md)
before contributing.

#### Running the unit tests ####

Open `test/index.html` in your browser to run the test suite.

**Headless:**

Install [Node.js](http://nodejs.org), [Grunt.js 0.4](http://gruntjs.com), and
run `npm install -q` inside the project directory.

Make sure you've installed `grunt-cli` globally with:

``` bash
npm install grunt-cli -gq
```

Run `grunt` inside a terminal in the project directory to run the tests in both
a headless browser and Node.js environment.

[travis-url]: http://travis-ci.org/tbranyen/backbone.layoutmanager
[travis-image]: https://img.shields.io/travis/tbranyen/backbone.layoutmanager.svg
[npm-url]: https://npmjs.org/package/backbone.layoutmanager
[npm-image]: https://img.shields.io/npm/v/backbone.layoutmanager.svg
[coveralls-url]: https://coveralls.io/r/tbranyen/backbone.layoutmanager
[coveralls-image]: https://img.shields.io/coveralls/tbranyen/backbone.layoutmanager.svg

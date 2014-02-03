LayoutManager
-------------

**Stable: 0.9.5** 

[![Build
Status](https://travis-ci.org/tbranyen/backbone.layoutmanager.png?branch=master)](https://travis-ci.org/tbranyen/backbone.layoutmanager)
[![Dependency
Status](https://gemnasium.com/tbranyen/backbone.layoutmanager.png)](https://gemnasium.com/tbranyen/backbone.layoutmanager)
[![Coverage
Status](https://coveralls.io/repos/tbranyen/backbone.layoutmanager/badge.png?branch=master)](https://coveralls.io/r/tbranyen/backbone.layoutmanager?branch=master)

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

* Removed `partial` shim from Node compatibility layer.  No longer necessary.
* Removed `getAllOptions`, no longer necessary with 1.1.0.
* Now run our tests against the latest stable and unstable Node.js.
* `setView` will never render a View now.
* Broke out Grunt tasks into separate files.
* Enforcing code style with JSCS.

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

Backbone.LayoutManager
======================

**v0.8.7** [![Build
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

* Upgraded Cheerio dependency.
* Trim templates in `el: false` Views to fix an issue with passing contents
  into `$()`.

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

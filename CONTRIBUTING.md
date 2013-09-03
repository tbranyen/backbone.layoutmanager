## Contributing to LayoutManager ##

### Filing an issue ###

You're using LayoutManager and something doesn't appear to function the way
it's described or you're thinking something could be done better.  Please let
us know.  Issues are how the project moves forward; by letting us know what's
bothering you.

* Search the [issues
  list](https://github.com/tbranyen/backbone.layoutmanager/issues)
  for existing similar issues.  Consider adding to an existing issue if you
  find one.
* Choose an applicable title.  This will be used for a corresponding unit test.
* Provide a unit test or snippet that illustrates the problem.  This small
  gesture goes a long way in a speedy patch.

### Sending a pull request ###

If you feel confident that you can correct a bug or add a new feature, feel
free to submit a pull request with your changes.  Everyone helping makes the
project community instead of a sole proprietorship.

* Link to an existing issue if applicable, create one to start discussion to
  ensure everyone is on board with the change and so you don't spend time
  writing a fantastic patch we cannot accept.
* Provide a description of what the patch is/does.
* Provide unit tests in the correct file:
  + `test/configure.js` for configuration changes.
  + `test/dom.js` for DOM specific changes.
  + `test/expose.js` for code exposure in various environments.
  + `test/setup.js` for changes that impact `Backbone.View` and
    `Backbone.Layout` mirroring eachother.
  + `test/view.js` for all changes that impact the API of LayoutManager
    Views.
* Make sure you open the pull request onto the `wip` branch and not `master`
  for requests that break the API or add significant functionality changes.
* Open pull requests on `master` only with bug fixes and patch related updates.

### Code style ###

I am very sensitive to maintaining a holistic codebase and that includes a
single code style.  Pull requests may be rejected or modified to ensure this
code style is maintained.

* Follow close to [BSD KNF
  style](http://en.wikipedia.org/wiki/Indent_style#BSD_KNF_style).
* Use two space, expanded/soft tabs.  Use `\t` if you need a tab character in a
  string.
* No trailing whitespace, except in markdown files where a linebreak must be
  forced.
* Don't go overboard with the whitespace.
* No more than one assignment per var statement.
* Delimit strings with double-quotes ", not single-quotes '.
* Comments must always contain proper punctuation and end with a correct
  sentence terminator.  Put before the line of code, not at the end of the
  line.
* Prefer if and else to "clever" uses of ? : conditional or ||, && logical
  operators.
* When in doubt, follow the conventions you see used in the source already.

### Documentation ###

We strive to make the project as easy to consume and use as possible which
means having consistent and up-to-date documentation.  If you notice something
is outdated or incorrect, please file an issue, pull request, or make the
change yourself in the Wiki.

* Add documentation to the
  [Wiki](https://github.com/tbranyen/backbone.layoutmanager/wiki) if
  applicable.
* Release notes are added to the
  [readme.md](https://github.com/tbranyen/backbone.layoutmanager/blob/master/README.md)
  if applicable.

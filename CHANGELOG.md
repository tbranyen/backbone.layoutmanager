## 0.9.4 ##

* Fixed trimming for incoming templates so that multiple top level elements
  warning isn't triggered annoyingly.
* Upgraded to work with Backbone 1.1.0.
* Minor housekeeping commits.

## 0.9.3 ##

* Style/spelling updates to markdown files.
* Broke out `_viewRender` and `_applyTemplate` from their closures and exposed
  them on the LM object.
* Parsing with `$.parseHTML` to allow leading whitespace and retain whitespace
  in templates.
* Using Bower to manage testing depenencies.
* Fixes for Underscore 1.5.

## 0.9.2 ##

* Updated AMD define shim to use UMD which fixes issues in some R.js builds.
* Updated views property to accept functions that return values, see #367.
* Fixed Node.js file lookup that was scoping to `__dirname`.
* Ensured all examples work.
* Hooked up Coveralls for monitoring and displaying code coverage during builds.

## 0.9.1 ##

* Fixed regression from 0.8->0.9 where the new AMD wrapper would fail to work
  correctly in an r.js build.
* Fixed regression from 0.8->0.9 where the Node.js branch code was not updated
  correctly and lack of default `fetchTemplate` tests didn't report the
  failure.

## 0.9.0 ##

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

## 0.8.8 ##

* Upgraded Cheerio dependency to v0.11.0.
* Many optimizations and fixes to `getViews` by @jugglinmike.  This includes
  fixes for issues like `removeView` on an invalid selector.
* `cleanup` is now called with the proper context.
* @SBoudrias added `.gitattributes` and `.editconfig` to ease development
  stress for our contributors.
* Fix provided by @adamdicarlo to fix a bug where re-rendering with
  empty rendered contents would not replace the existing content.

## 0.8.7 ##

* Upgraded Cheerio dependency.
* Trim templates in `el: false` Views to fix an issue with passing contents
  into `$()`.

## 0.8.6 ##

* We now log a warning if you use mutliple top level elements inside a View's
  template with `el: false`.  This will not affect most developers.  If you
  wish to suppress the warnings you can run `Backbone.Layout.configure({
  suppressWarnings: true });`.  This is documented in the Wiki:
  https://github.com/tbranyen/backbone.layoutmanager/wiki/Configuration#el
* Fixed minor bug with `cleanup` being defined on `options` instead of the instance.
* Changed behavior so that __all__ views are removed when you call `remove`.
* Upgraded to Backbone 1.0.
* Upgraded to Node 0.10.

## 0.8.5 ##

* Fixed View duplication bug with multiple top level elements (`el: false`).
* Fixed the deletion of the template property in initialize that would cause
  bugs with View inheritance.
* Fixed issue with `getView` and `_.where` object.

## 0.8.4 ##

* Fixed package dependency issues with jQuery.
* Updated Cheerio version, which includes fixes to `filter`.
* Several fixes to the `el: false` implementation.
* Removed custom `$.contains` Node.js implementation.

## 0.8.3 ##

* Fix for deep nested `el: false` elements.

## 0.8.2 ##

* Fixed parts of the Node build.
* Changed from parallel rendering to serial loading which will make the render
  process significantly more stable.
* Changed signature to `options.partial` and greatly fixed the way `noel` is
  handled.

## 0.8.1 ##

* Updated JamJS configuration settings.
* Fixed event delegation when self managing the View element.
* Fixed edge case with `afterRender` causes the element to not be in the
  parent container.
* Fixed re-rendering when self managing the View element.

## 0.8.0 ##

* Massive Node.js refactor, including: unit testing, significantly better
  browser parity, and allowing more seamless browser/server View sharing.
* Ability to disable `Backbone.View#el` wrapper element using `el: false` and
  opt for the first child inside the template instead.  Very experimental!
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
* Can now directly set a template function to the `template` property and not
  have to override fetch with an `_.identity` function.
* Miscellaneous code cleanup and minor bug/refactor fixes.

## 0.7.5 ##

* Updated lookup for `serialize` and `data` to also look on the instance so
  that `configure` doesn't always override.

### 0.7.4 ###

* Simplified insertion methods.
* Fixed named function expression bug in IE.

### 0.7.3 ###

* Refactored `_.extend` to `LayoutManager.augment` to work with Lo-Dash and
  underscore.
* Normalized rendering order, when the parent has already rendered.
* Added better error handling for node.js build.
* Updated error message for node.js build.
* Added in Travis-CI and README updates.

### 0.7.2 ###

* Fixed cheerio rendering bug with the latest version.
* Explicity depend and require underscore in NPM.
* Repeated subViews are a thing of the past :D.
* Fixed serialize/data priority.
* Fixed lodash issues and added in separate lodash testing.

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

### 0.7.0 ###

* Refactored source to be less cryptic.
* 100% test code coverage.
* Re-wrote much of the internals.
* Performance greatly improved, especially with large lists.
* Removed `swapLayout`.
* `serialize` is deprecated and replaced by `data`.
* `render(callback)` is deprecated to `render().done()` deferreds only.
* Automatically unbind `model` and `collection` events inside `cleanup`.
* `Backbone.LayoutView, `Backbone.Layout`, and `Backbone.View` (with `manage`
  set to `true`) are now all identical.
* `paths` is now a String `prefix`, set this to the folder where your templates live.
* `afterRender` now occurs after the `render()` deferred.
* `myView.render().view` now allows you to attach `view.el` after a render for
  some nice one-liners.
   `
new Backbone.LayoutView({ template: "#t" }).render().view.$el.appendTo("body");
`

### 0.6.6 ###

* Fixed asynchronous fetching bug that could in some circumstances duplicate
  list items
* Calling `remove` on a View now completely removes it from LayoutManager
* Fixed issues with `afterRender`
* Better error handling for when `manage: true` is missing

### 0.6.5 ###

* Corrected event binding behaviors depending on the parent.

### 0.6.4 ###

* Fixed regression with `afterRender`

### 0.6.3 ###

* Fixed a memory leak that existed with appended Views
* Updated all examples
* Fixed regression with events being bound to Layouts
* General performance tweaks
* Updated cheerio dependency to 0.9.2 for the Node implementation

### 0.6.2 ###

* Updated to support jQuery 1.8
* Fixed missing events when calling `view.render`
* Fixed issues with `afterRender` not triggering
* No longer copying options to the View instance

### 0.6.1 ###

* Patch release fixing issues and upgrading Node.js dependencies
* Fixed error where inserted views rendered out of order #116, #117
* Fixed issue where events were not being bound correctly #118

### 0.6.0 ###

* Overriding `render` is now deprecated.  Refer to `beforeRender` and
  `afterRender`.
* Added a `swap` method that can be used on a Layout which allows you to
  dynamically swap out the entire contents, but retain the rendered subViews.
* Code cleanup, removing unused code paths, properties, features, etc.
* Fixes to setView to not break when moving from an append mode to non-append
  mode.
* Several bug fixes.
* Added more unit tests.

### 0.5.2 ###

* More methods can be overwritten from initialization
* Render can now be bound like `this.collection.on("reset", this.render, this);`
* Fixes to `keep: true` and append example, only checking `keep` if View has
  already rendered

### 0.5.1 ###

* Patched massive memory leak and missing remove on setView
* Fixed bug with Named Function Expression breaking IE compatibility when
  minified
* Added `keep: true` to View's to stop them from being removed pre-render

### 0.5.0 ###

* Tons of new unit tests
* More API normalization
* Collection rendering bug fixes
* New View methods
  + insertView & insertViews
  + getView and getViews

### 0.4.1 ###

* Fixed major regression regarding list duplication

### 0.4.0 ###

* Detach no longer internally happens on the root Layout
* `manage` function inside a custom render has a new property `raw` for getting
  at the actual View instance
* Collection lists bugs solved
* Made `makeAsync` a private class method
* Cleanup method is now called whenever `remove` is called
* Major fixes allowing for single View append
* View function no longer requires "" for inserting into parent View
* SubView render functions only resolve after the element has been attached
  to its parent View.

### 0.3.0 ###

* Context is now consistent in either callbacks or deferreds
* `setViews` is now chainable
* `view` and `setViews` are now available at all times on `Backbone.View`'s
* Bug fixes regarding list duplication

### 0.2.1 ###

* Made `template` optional inside of `Backbone.View`
* Added custom cleanup function to handle the removal of any custom events
* insert no longer requires a selector
* Several performance improvements along with general stability changes

### 0.2.0 ###

* Major re-write to codebase that eliminated a lot of repetitive and cludgy
  code
* Deprecated the need to extend `Backbone.LayoutManager.View`
* All View `render` methods return promises and can accept a callback
* Views now render themselves first and then resolve/trigger the callback once
  all the children are rendered.  This helps with jQuery plugins.

### 0.1.2 ###

* Major patch for re-rendering layouts that would lose events
* Added new API method detach

### 0.1.1 ###

* Minor patch release (that removes an undocumented feature)
* Fixed issue with events not being registered correctly within lists

### 0.1.0 ###

* Lots of bug fixes!
* Ability to insert views dynamically using the new `view.insert` method.
  Useful for collections.
* Setting/resetting sub views possible with new `view.setViews` method.
* All views now have the `view/setViews` methods.
* Updates to allow LayoutManager to be extended easier, along with `events`
  being bound automatically during initialization.

### 0.0.4 ###

* Adding views turned into a reusable function called `view`.
* Templates no longer are required to be a string, this allows passing of
  compiled template functions.

### 0.0.3 ###

* View renders are internally wrapped to expose a new `render()` method that
  when called, re-renders.
* Nested views are possible by adding a `views` sub property which is an object
  that contains nested views.

### 0.0.2 ###

* Changed layout `name` property to `template` for consistency.
* Internal second deferred replaces the `viewDeferred` to determine when an
  element enters the DOM.

### 0.0.1 ###

* Open sourced on GitHub.
* Initial unit tests.
* Released introduction screencast.

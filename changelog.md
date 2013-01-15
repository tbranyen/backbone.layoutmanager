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

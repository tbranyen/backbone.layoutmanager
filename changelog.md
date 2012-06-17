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

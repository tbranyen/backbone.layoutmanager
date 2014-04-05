module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "default", [
    "clean"
    "jscs"
    "jshint"
    "browserify"
    "qunit"
    "nodequnit"
  ]

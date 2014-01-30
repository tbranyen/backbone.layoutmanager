module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "default", [
    "clean"
    "jscs"
    "jshint"
    "qunit"
    "nodequnit"
  ]

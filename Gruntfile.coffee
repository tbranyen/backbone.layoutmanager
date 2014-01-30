module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "default", [
    "clean", "jshint", "qunit", "nodequnit"
  ]

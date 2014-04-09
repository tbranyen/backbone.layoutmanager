module.exports = ->
  @loadNpmTasks "grunt-contrib-clean"

  @config "clean", [
    "test/report"
  ]

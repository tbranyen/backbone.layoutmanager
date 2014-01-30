module.exports = ->

  @config "clean", [
    "test/report"
  ]

  @loadNpmTasks "grunt-contrib-clean"

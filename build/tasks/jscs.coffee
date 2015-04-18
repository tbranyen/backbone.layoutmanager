module.exports = ->
  @loadNpmTasks "grunt-jscs"

  @config "jscs",
    src: "backbone.layoutmanager.js"

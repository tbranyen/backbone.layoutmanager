module.exports = ->

  @config "jscs",
    options:
      config: ".jscs.json"

    src: "backbone.layoutmanager.js"

  @loadNpmTasks "grunt-jscs-checker"

module.exports = ->

  @config "jscs",
    options:
      config: ".jscs.json"

    src: "src/backbone.layoutmanager.js"

  @loadNpmTasks "grunt-jscs-checker"

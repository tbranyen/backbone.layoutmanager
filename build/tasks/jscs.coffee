module.exports = ->
  @loadNpmTasks "grunt-jscs-checker"

  @config "jscs",
    options:
      config: ".jscs.json"

    src: "backbone.layoutmanager.js"

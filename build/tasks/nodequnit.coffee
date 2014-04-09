module.exports = ->
  @loadNpmTasks "grunt-nodequnit"

  @config "nodequnit",
    files: ["test/spec/*.js", "!test/spec/dom.js"]

    options:
      deps: ["test/util/util.js"]
      code: "."
      testsDir: "test/spec/"

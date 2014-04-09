module.exports = ->
  @loadNpmTasks "grunt-qunit-istanbul"

  @config "qunit",
    options:
      "--web-security": "no"

      coverage:
        src: ["backbone.layoutmanager.js"]
        instrumentedFiles: "test/tmp/coverage"
        htmlReport: "test/report/coverage"
        coberturaReport: "test/report"
        lcovReport: "test/report"
        linesThresholdPct: 85

    files: ["test/index.html"]

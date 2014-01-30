module.exports = ->

  @config "qunit",
    options:
      "--web-security": "no"

      coverage:
        src: ["backbone.layoutmanager.js"]
        instrumentedFiles: "test/tmp"
        htmlReport: "test/report/coverage"
        coberturaReport: "test/report"
        lcovReport: "test/report"
        linesThresholdPct: 85

    files: ["test/index.html"]

  @loadNpmTasks "grunt-qunit-istanbul"

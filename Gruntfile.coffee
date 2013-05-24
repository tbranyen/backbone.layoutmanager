# Grunt configuration updated to latest Grunt.  That means your minimum
# version necessary to run these tasks is Grunt 0.4.
#
# Please install this locally and install `grunt-cli` globally to run.
module.exports = ->

  Table = require "cli-table"

  # Initialize the configuration.
  @initConfig

    # Lint source, node, and test code with some sane options.
    jshint:
      files: ["backbone.layoutmanager.js", "node/index.js"]

      # Allow certain options.
      options:
        browser: true
        boss: true
        immed: false
        eqnull: true
        globals: {}

    # Run QUnit tests for browser environments.
    qunit:
      options:
        "--web-security": "no"

        coverage:
          src: ["backbone.layoutmanager.js"]
          instrumentedFiles: "test/tmp"
          htmlReport: "test/report/coverage"
          coberturaReport: "test/report"
          linesThresholdPct: 85

      files: ["test/index.html"]

    # Run QUnit tests for Node.js environments.
    nodequnit:
      files: ["test/*.js", "!test/dom.js"]

      options:
        deps: ["test/vendor/util.js"]
        code: "."
        testsDir: "test/"

    # Want to ensure common use cases are accounted for and that we do not
    # make changes that dramatically impact general performance.
    benchmark:
      all: 
        src: ["test/benchmark/*.js"]
        dest: "test/report/benchmark_results.csv"

  # Display the results in a table.
  @registerTask "results", =>
    # Read in CSV and split on new lines.
    rows = @file.read("test/report/benchmark_results.csv").trim().split "\n"
    # Separate the headers from the rows.
    headers = rows.shift().split ","
    
    # Turn each row of data into separate values.
    rows = for row in rows
      row.split ","

    # Create a new table.
    table = new Table(head: headers)
    table.push.apply(table, rows)

    # Render out the table.
    @log.write table

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-qunit-istanbul"
  @loadNpmTasks "grunt-nodequnit"
  @loadNpmTasks "grunt-benchmark"

  # Default task.
  @registerTask "default", [
    "jshint", "qunit", "nodequnit", "benchmark", "results"
  ]

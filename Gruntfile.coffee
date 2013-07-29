# Grunt configuration updated to latest Grunt.  That means your minimum version
# necessary to run these tasks is Grunt 0.4.
#
# Please install this locally and install `grunt-cli` globally to run.
module.exports = ->

  # Initialize the configuration.
  @initConfig
    
    # Empty the reports folder.
    clean:
      files: ["test/report"]

    # Lint source, node, and test code with some sane options.
    jshint:
      files: ["backbone.layoutmanager.js"]

      node:
        files:
          src: ["node/index.js"]
        options:
          node: true

      test:
        files:
          src: ["test/*.js"]
        options:
          maxlen: false
          globals:
            global: true
            $: true
            Backbone: true
            _: true
            require: true
            QUnit: true
            start: true
            stop: true
            ok: true
            equal: true
            deepEqual: true
            notEqual: true
            asyncTest: true
            test: true
            expect: true
            testUtil: true

      # Allow certain options.
      options:
        browser: true
        boss: true
        immed: false
        eqnull: true
        maxlen: 80
        es3: true
        curly: true
        quotmark: "double"
        trailing: true
        unused: true
        undef: true
        globals:
          global: true

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

    # Want to ensure common use cases are accounted for and that we do not make
    # changes that dramatically impact general performance.
    benchmark:
      options:
        displayResults: true

      all:
        src: ["test/benchmark/*.js"]
        dest: "test/report/benchmark_results.csv"

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-clean"
  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-qunit-istanbul"
  @loadNpmTasks "grunt-nodequnit"
  @loadNpmTasks "grunt-benchmark"

  # Default task.
  @registerTask "default", [
    "clean", "jshint", "qunit", "nodequnit", "benchmark"
  ]

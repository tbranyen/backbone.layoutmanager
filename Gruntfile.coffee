module.exports = ->

  # Configuration.
  @initConfig
    
    clean: ["test/report"]

    jshint:
      files: ["backbone.layoutmanager.js"]

      node:
        files:
          src: ["node/index.js"]
        options:
          node: true

      test:
        files:
          src: ["test/spec/*.js", "test/util/*.js"]
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

      options: @file.readJSON ".jshintrc"

    qunit:
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

    nodequnit:
      files: ["test/spec/*.js", "!test/spec/dom.js"]

      options:
        deps: ["test/util/util.js"]
        code: "."
        testsDir: "test/spec/"

    benchmark:
      options:
        displayResults: true

      all:
        src: ["test/benchmark/*.js"]
        dest: "test/report/benchmark_results.csv"

  # Plugins.
  @loadNpmTasks "grunt-contrib-clean"
  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-qunit-istanbul"
  @loadNpmTasks "grunt-nodequnit"
  @loadNpmTasks "grunt-benchmark"

  # Tasks.
  @registerTask "default", [
    "clean", "jshint", "qunit", "nodequnit", "benchmark"
  ]

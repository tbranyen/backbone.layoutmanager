# Grunt configuration updated to latest Grunt.  That means your minimum
# version necessary to run these tasks is Grunt 0.4.
#
# Please install this locally and install `grunt-cli` globally to run.
module.exports = ->

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
        evil: true
        globals: {}

    # Run QUnit tests for Lo-Dash and Underscore. They will be merged soon,
    # since LayoutManager has changed its dependency back to a hard Underscore.
    # The lodash.underscore still works perfectly fine.
    qunit:
      underscore: ["test/underscore.html"]
      lodash: ["test/lodash.html"]

    # Special QUnit tests to be run in Node.js.
    nodequnit:
      files: ["expose.js", "configure.js", "setup.js", "views.js"]

      options:
        deps: ["test/vendor/util.js"]
        code: "."
        testsDir: "test/"

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-contrib-qunit"
  @loadNpmTasks "grunt-nodequnit"

  # Default task.
  @registerTask "default", ["jshint", "qunit", "nodequnit"]

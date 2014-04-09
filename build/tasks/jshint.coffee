module.exports = ->
  @loadNpmTasks "grunt-contrib-jshint"

  @config "jshint",
    files: ["backbone.layoutmanager.js"]
    options: @file.readJSON ".jshintrc"

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

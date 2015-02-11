module.exports = ->
  @loadNpmTasks "grunt-browserify"

  @config "browserify",

    dist:
      options:
        browserifyOptions:
          standalone: 'browserifyLM'

      src: 'backbone.layoutmanager.js',
      dest: 'test/tmp/backbone.layoutmanager.browserify.js'

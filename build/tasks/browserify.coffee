module.exports = ->

  @config "browserify",

    dist:
      options:
        bundleOptions:
          standalone: 'browserifyLM'
      src: 'backbone.layoutmanager.js',
      dest: 'test/tmp/backbone.layoutmanager.browserify.js'

  @loadNpmTasks "grunt-browserify"

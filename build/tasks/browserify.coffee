module.exports = ->

  @config "browserify",

    dist:
      src: 'backbone.layoutmanager.js',
      dest: 'build/backbone.layoutmanager.bundle.js'

  @loadNpmTasks "grunt-browserify"

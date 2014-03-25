module.exports = ->

  @config "browserify",

    dist:
      options:
        external: ['jquery', 'underscore', 'backbone']
        bundleOptions:
          standalone: 'backbone.layoutmanager'
      src: 'src/backbone.layoutmanager.js',
      dest: 'backbone.layoutmanager.js'

  @loadNpmTasks "grunt-browserify"

module.exports = ->

  @config "targethtml",

    # Create browserify test file so we don't have to repeat ourselves
    browserify:
      files:
        'test/index-browserify.html': 'test/index.html'

  @loadNpmTasks "grunt-targethtml"

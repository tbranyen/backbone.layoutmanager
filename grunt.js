/*global config:true, task:true*/
config.init({
  lint: {
    files: ["grunt.js", "backbone.layoutmanager.js"]
  },

  min: {
    "dist/backbone.layoutmanager.min.js": "backbone.layoutmanager.js"
  },

  watch: {
    files: "<config:lint.files>",
    tasks: "lint test"
  },

  jshint: {
    options: {
      boss: true,
      curly: true,
      eqeqeq: true,
      immed: false,
      latedef: true,
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      eqnull: true,
      node: true
    },
    globals: {}
  },

  qunit: {
    files: [ "test/**/*.html" ]
  }
});

// Default task.
task.registerTask("default", "lint qunit min");

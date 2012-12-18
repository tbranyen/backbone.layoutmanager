module.exports = function(grunt) {
  "use strict";

  grunt.loadTasks("tasks");

  grunt.initConfig({
    lint: {
      files: ["grunt.js", "backbone.layoutmanager.js"]
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

    "node-qunit": {
      deps: ["./test/vendor/util.js"],
      code: ".",
      tests: [
        "./test/expose.js",
        "./test/configure.js",
        "./test/setup.js",
        "./test/views.js"
      ]
    },

    qunit: {
      underscore: ["test/underscore.html"],
      lodash: ["test/lodash.html"]
    }
  });

  grunt.registerTask("test", "qunit:underscore qunit:lodash node-qunit");

  // Default task.
  grunt.registerTask("default", "lint test");

};

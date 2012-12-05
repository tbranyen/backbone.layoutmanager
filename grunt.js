module.exports = function(grunt) {
  "use strict";

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

    qunit: {
      underscore: ["test/underscore.html"],
      lodash: ["test/lodash.html"]
    }
  });

  // Default task.
  grunt.registerTask("default", "lint qunit:underscore qunit:lodash");

};

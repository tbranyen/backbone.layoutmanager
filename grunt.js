module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: "<json:package.json>",

    meta: {
      banner: "/*!\n" + " * backbone.layoutmanager.js v<%= pkg.version %>\n" +
        " * Copyright 2012, Tim Branyen (@tbranyen)\n" +
        " * backbone.layoutmanager.js may be freely distributed under" +
        " the MIT license.\n */"
    },

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

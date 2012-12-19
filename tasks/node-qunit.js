// grunt-node-qunit
// Adapted from the "grunt-node-qunit" grunt task:
// https://github.com/axemclion/grunt-node-qunit

module.exports = function(grunt) {
  grunt.registerTask("node-qunit", "Runs node-qunit ", function() {

    var qunit = require("qunit");
    var done = this.async();
    var started = new Date();
    var defaults = {
      timeout: 2000,
      setup: {
        log: {
          summary: true,
          errors: true
        }
      }
    };

    qunit.options.timeout = grunt.config('node-qunit.timeout') || defaults.timeout;

    qunit.setup(grunt.config('node-qunit.setup') || defaults.setup);

    qunit.run({
       deps: grunt.config('node-qunit.deps'),
       code: grunt.config('node-qunit.code'),
       tests: grunt.config('node-qunit.tests')
    }, function(err, result){
      var func = grunt.config('node-qunit.done');
      var waitForAsync = false;
      var res;

      result.started = started;
      result.completed = new Date();

      this.async = function() {
        waitForAsync = true;
        return function(status) {
          done(typeof status === "undefined" ? (result.failed === 0) : status);
        }
      }

      if (typeof func === "function") {
        res = func(err, result);
      }

      if (!waitForAsync) {
        done(typeof res === "undefined" ? (result.failed === 0) : res);
      }
    });
  });
};

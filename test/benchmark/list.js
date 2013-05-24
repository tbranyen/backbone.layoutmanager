exports.name = "Collection rendering";

exports.tests = {

  "10 models": {
    maxTime: 2,
    defer: true,

    setup: function() {
      
    },

    fn: function(deferred) {
      setTimeout(function() {
        deferred.resolve();
      }, 500);
    }
  }

};

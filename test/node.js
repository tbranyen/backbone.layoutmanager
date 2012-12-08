var qunit = require("qunit");

qunit.run({
	deps: ["./test/vendor/util.js"],
	code: ".",
	tests: [
		"./test/expose.js",
		"./test/configure.js",
		"./test/setup.js",
		"./test/views.js"
	]
});

var testUtil = {
	trim: function(str) {
		return str.replace(/^\s+|\s+$/g, "");
	},
	templates: {
		main: '<div class="left">Left</div><div class="right"></div>',
		testSub: '<%=text%>'
	}
};

if (typeof exports !== "undefined") {
	if (typeof module !== "undefined" && module.exports) {
		exports = module.exports = testUtil;
	}
	exports.testUtil = testUtil;
}

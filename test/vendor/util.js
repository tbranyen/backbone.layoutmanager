var testUtil = {
  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, "");
  },
  templates: {
    main: '<div class="left">Left</div><div class="right"></div>',
    test: '<span class="inner-left"><%=text%></span><span class="inner-right"></span>',
    testSub: '<%=text%>',
    list: '<ul></ul>',
    view0: '<div class="view0">0</div>',
    view1: '<div class="view1">1</div>',
    view2: '<div class="view2">2</div>',
    view3: '<div class="view3">3</div>',
    listItem: '<div class="listItem"><%= item %></div>'
  }
};

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    exports = module.exports = testUtil;
  }
  exports.testUtil = testUtil;
}

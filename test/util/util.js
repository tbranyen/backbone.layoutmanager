/*jshint node:true */
var testUtil = {
  trim: function(str) {
    return str ? str.replace(/^\s+|\s+$/g, "") : "";
  },
  templates: {
    main: "<div class='left'>Left</div><div class='right'></div>",
    test: "<span class='inner-left'><%=text%></span><span class" +
      "='inner-right'></span>",
    testSub: "<%=text%>",
    list: "<ul></ul>",
    item: "<li><%=text%></li>",
    view0: "<div class='view0'>0</div>",
    view1: "<div class='view1'>1</div>",
    view2: "<div class='view2'>2</div>",
    view3: "<div class='view3'>3</div>",
    listItem: "<div class='listItem'><%= item %></div>"
  },
  inNodeJs: function() {
    return typeof module !== "undefined" && module.exports;
  },
  // isDomNode
  // Determine if the supplied object is a DOM node (in Node.js, DOM nodes are
  // simulated by Cheerio objects)
  isDomNode: function(obj) {
    if (testUtil.inNodeJs()) {
      return obj && "type" in obj && "children" in obj && "parent" in obj;
    } else {
      return obj && obj.nodeType != null;
    }
  }
};

// If this code is running as a Node.js module, attach the utilities to the
// module.
if (testUtil.inNodeJs()) {
  exports.testUtil = testUtil;
  exports.lodash = require("lodash");
  exports.underscore = require("underscore");
}

import {FieldTypes} from './datastore/field_types.js';
import {TestAgentOSLookup} from './test_agent/test_agent_os.js';
import {Nodes} from './node/node.js';
import {TestCaseStepTypes} from './test_case/test_case_step_types.js';

/**
 * Utility functions
 */
export const Util = {
  variableInputPattern: '^[a-zA-Z][\\w]*?$',

  /**
   * Turn a string into a JSON key-safe string, forcing to lowercase
   * @param name The string to be made key-safe
   */
  dataKey: function (title) {
    return title.replace(/[\W]/g, "_").replace(/^[0-9]+/, "N").toLowerCase();
  },

  /**
   * Turn a string into a JSON key-safe string, but preserve case
   * @param name The string to be made key-safe
   */
  varName: function (name) {
    return name.replace(/[\W]/g, "_").replace(/^[0-9]+/, "N");
  },

  /**
   * Strip off the server & params from a url
   * @param url
   */
  urlPath: function (url) {
    check(url, String);
    return url.replace(/^[https\:\/]*/, "").replace(/^[^\/]+/, "").split("?")[0];
  },

  /**
   * Strip off the path and return just the query params
   * @param url
   */
  urlQuery: function (url) {
    check(url, String);
    return url.split("?")[1];
  },

  /**
   * Strip off the path and return the parsed params
   * @param url
   */
  urlParams: function (url) {
    check(url, String);
    var query = Util.urlQuery(url),
      params = [], paramPieces;

    if(query){
      _.each(query.split("&"), function (param) {
        paramPieces = param.split("=");
        params.push({
          param: paramPieces[0],
          value: paramPieces[1]
        });
      });
    }
    return params;
  },

  /**
   * Turns whatever arguments passed into an assembled url
   * @returns {string} The assembled url built from whatever was passed
   */
  buildUrl: function () {
    var pieces = [], parts;
    _.each(arguments, function (argv) {
      if(_.isArray(argv)){
        _.each(argv, function (subargv) {
          parts = subargv.toString().replace(/^\//, "").replace(/\/$/, "").split(/\/(?!\/)/);
          _.each(parts, function (p) {
            pieces.push(p);
          });
        });
      } else if(argv) {
        // process the string
        parts = argv.toString().replace(/^\//, "").replace(/\/$/, "").split(/\/(?!\/)/);
        _.each(parts, function (p) {
          pieces.push(p);
        });
      }
    });
    return pieces.join("/");
  },

  /**
   * Get the base type for a given field type
   * @param type The FieldType enum value
   * @returns {*} The literal type for the given FieldType
   */
  fieldTypeLiteral: function (type) {
    switch(type){
      case FieldTypes.string:
        return String;
      case FieldTypes.boolean:
        return Boolean;
      case FieldTypes.number:
        return Number;
      case FieldTypes.date:
        return Date;
      case FieldTypes.custom:
        return Object;
    }
  },

  /**
   * Capitalize a string
   * @param word The string to capitalize
   */
  capitalize: function (word) {
    if(word) {
      return word.substr(0,1).toUpperCase() + word.substr(1);
    }
    return word;
  },

  /**
   * Convert camel case to title case
   * @param word
   */
  camelToTitle: function (word) {
    if(word){
      return (word.substr(0,1).toUpperCase() + word.substr(1)).replace(/([A-Z])/g, " $1").trim();
    }
  },

  /**
   * Convert camel case to dashed words
   * @param word
   */
  camelToDash: function (word) {
    if(word){
      return word.replace(/([A-Z])/g, "-$1").trim().toLowerCase();
    }
  },

  /**
   * Convert words to a CamelCase string
   * @param words
   */
  wordsToCamel: function (words) {
    if(words){
      return words.replace(/[\W]/g, " ")
                  .replace(/(^[a-z]|\s+[a-z])/g, (letter) => {return letter.trim().toUpperCase()})
                  .replace(/\s/g, "");
    }
  },

  /**
   * Get the name of a test agent with the versions
   * @param testAgent The testAgent record to build the name for
   */
  getTestAgentNameWithVersion: function (testAgent) {
    if(testAgent.title){
      return testAgent.title + (testAgent.version ? " " + testAgent.version : "") + " on " + TestAgentOSLookup[testAgent.os] + (testAgent.osVersion ? " " + testAgent.osVersion : "")
    }
    return '';
  },

  /**
   * For an element in the live console, determine the best way to identify it
   * @param element
   */
  getHighlightedElementSelector: function (element) {
    // check to see if it has an id
    var idAttr;
    _.each(element.attributes, function (attr) {
      if(!idAttr && attr.name == "id"){
        idAttr = attr;
      }
    });
    if(idAttr){
      return "//" + element.tag + "[@id='" + idAttr.value + "']";
    }

    // check to see if this is a link with an href
    var hrefAttr;
    _.each(element.attributes, function (attr) {
      if(!hrefAttr && attr.name == "href"){
        hrefAttr = attr;
      }
    });
    if(hrefAttr){
      if(hrefAttr.value){
        return "//" + element.tag + "[@href='" + hrefAttr.value + "']";
      }
    }

    // check to see if it has at least one class to use
    var classAttr;
    _.each(element.attributes, function (attr) {
      if(!classAttr && attr.name == "class"){
        classAttr = attr;
      }
    });
    if(classAttr){
      return "//" + element.tag + "[@class='" + classAttr.value + "']";
    }

    // use the big hammer and specify the full path
    var xPath = Util.getHighlightedElementLineageXPath(element);
    if(element.text && element.text.length){
      xPath += "[contains(text(), '" + element.text + "')]";
    } else {

    }
    return xPath;
  },

  /**
   * Recursively build an xPath from a highlighted element structure
   * @param element The current element
   * @param xPath The current xPath
   * @returns {string} The entire xPath leading to the initial element, structure only
   */
  getHighlightedElementLineageXPath: function (element, xPath) {
    xPath = xPath || "";
    xPath = "/" + element.tag + xPath;
    if(element.parent && element.parent.tag){
      xPath = Util.getHighlightedElementLineageXPath(element.parent, xPath);
    }
    return xPath;
  },

  /**
   * Escape double quotes in a string
   * @param str
   * @returns {string}
   */
  escapeDoubleQuotes: function (str) {
    if(str && str.length){
      var escapedFix = new RegExp("\/\"", "g"),
        quoteFix = new RegExp("\"", "g");
      return str.replace(escapedFix, "\\\\\"").replace(quoteFix, "\\\"");
    }
  },

  /**
   * Get the platform and usertype for a node
   * TODO: this data is now denormalized, this should be eliminated
   */
  getNodePlatformUserType: function (node) {
    var platform, userType,
      level = 0;

    // follow the structure up to the determine the platform and user type
    while(node.type !== NodeTypes.root && level++ < 1000){
      console.log("getNodePlatformUserType Checking node: ", node.title, NodeTypesLookup[node.type]);
      if(node.type == NodeTypes.platform){
        platform = node._id;
      } else if(node.type == NodeTypes.userType){
        userType = node._id;
      }
      node = Nodes.findOne({staticId: node.parentId, projectVersionId: node.projectVersionId});
    }

    console.log("getNodePlatformUserType: ", platform, userType);
    return {
      platform: platform,
      userType: userType
    }
  },

  /**
   * Find a piece of data at an unknown parent depth
   */
  findParentData: function (key) {
    for(var i = 0; i < 20; i++){
      try {
        var data = Template.parentData(i);
        if(data && data.hasOwnProperty(key)){
          console.log("findParentData", "[" + key + "] found at depth", i);
          //console.log("findParentData", "[" + key + "] found at depth", i, ":", data[key]);
          return data[key];
        }
      } catch (e) {
        console.error("findParentData failed for key [" + key + "]: " + e.toString());
      }
    }
  },

  /**
   *
   * @param view
   */
  findTemplateFromView: function (view){
    while(!view.templateInstance() && view.parentView){
      return Util.findTemplateFromView(view.parentView)
    }
    if(view.templateInstance){
      return view.templateInstance()
    }
  },

  /**
   * Get a full measure of an elements scoll top and left
   */
  getAbsoluteScroll: function (rawEl) {
    var el = $(rawEl),
      fixedPositionFound = false,
      scroll = {top: 0, left: 0};
    while(el && !fixedPositionFound){
      scroll.top += el.scrollTop();
      scroll.left += el.scrollLeft();
      if(el.css("position") && el.css("position").toLowerCase() == "fixed"){
        //console.log("fixedPositionFound: ", el);
        fixedPositionFound = true;
        scroll = {
          top: $("body").scrollTop(),
          left: $("body").scrollLeft()
        };
      } else {
        el = el.parent();
      }
    }
    return scroll;
  },

  /**
   * Get the screen bounds of an element
   */
  getScreenBounds: function (rawEl) {
    var el = $(rawEl),
      offset  = el.offset(),
      scroll  = Util.getAbsoluteScroll(rawEl),
      bounds  = {
        width: el.outerWidth(),
        height: el.outerHeight(),
        top: offset.top - scroll.top,
        left: offset.left - scroll.left
      };
    //console.log("getScreenBounds: ", offset, scroll);

    // if the source element is an SVG element we need to get the width differently
    if(el.closest("svg").length){
      bounds.width  = el[0].getBoundingClientRect().width;
      bounds.height = el[0].getBoundingClientRect().height;
    }

    return bounds;
  },

  /**
   * Return the container class for a test case step type
   * @param type
   */
  testStepContainerClass: function (type, error) {
    var cssClass = "";
    if(error){
      cssClass = "roba-round-container-error";
    } else {
      if(type != null){
        switch (type) {
          case TestCaseStepTypes.node:
            cssClass = "roba-round-container-blue";
            break;
          case TestCaseStepTypes.action:
            cssClass = "roba-round-container-green";
            break;
          case TestCaseStepTypes.navigate:
            cssClass = "roba-round-container-purple";
            break;
          case TestCaseStepTypes.wait:
            cssClass = "roba-round-container-light-blue";
            break;
          case TestCaseStepTypes.custom:
            cssClass = "roba-round-container-orange";
            break;
        }
      }
    }

    return cssClass
  },

  /**
   * Return the icon class for a test case step type
   * @param type
   */
  testStepTypeIcon: function (type) {
    if(type != null){
      switch (type) {
        case TestCaseStepTypes.node:
          return "glyphicon-unchecked";
        case TestCaseStepTypes.action:
          return "glyphicon-random";
        case TestCaseStepTypes.navigate:
          return "glyphicon-random";
        case TestCaseStepTypes.wait:
          return "glyphicon-link";
        case TestCaseStepTypes.custom:
          return "glyphicon-ok-circle";
      }
    }
  },
  
  /**
   * SVG Text wrapping
   * https://bl.ocks.org/mbostock/7555321
   * @param text
   * @param width
   */
  wrapSvgText: function (text, width) {
    //console.log("wrapSvgText:", text, width);
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy") || 0),
          tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  },
  
  /**
   * Go hunting for UTF-8 characters
   * @param start
   * @param stop
   */
  debugUtf8(start, stop){
    for(let i = start; i < stop; i++){
      let hexVal = i.toString(16);
      $(".center-pole-content").append('<style>.test-'+hexVal+':before { content:\'\\'+hexVal+'\'; }</style>' +
          '<span class="test-'+hexVal+'" style="color:#f00; font-size: 24px; width:30px; display: inline-block;"></span>');
    }
  }
};

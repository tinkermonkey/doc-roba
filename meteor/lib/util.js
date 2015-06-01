/**
 * Create a cache for storing data store schemas that have been generated
 */
DataStoreSchemas = {};

/**
 * Utility functions
 */
Util = {

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
  }
};

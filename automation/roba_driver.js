/**
 * Basic future-ized wrapper for webdriverio
 */

var Future        = require("fibers/future"),
  _               = require("underscore"),
  log4js          = require("log4js"),
  assert          = require("assert"),
  webdriver       = require("webdriverio"),
  fs              = require("fs"),
  RobaPreviewer   = require("./roba_previewer"),
  logger          = log4js.getLogger("roba-driver"),
  browserLogger   = log4js.getLogger("browser"),
  clientLogger    = log4js.getLogger("client"),
  driverLogger    = log4js.getLogger("driver"),
  serverLogger    = log4js.getLogger("server"),
  commands        = {
    "action": [
      "addValue", "clearElement", "click", "doubleClick", "dragAndDrop", "leftClick", "middleClick", "rightClick",
      "selectorExecute", "selectorExecuteAsync", "setValue", "submitForm"
    ],
    "appium": [
      "backgroundApp", "closeApp", "context", "deviceKeyEvent", "getAppStrings", "getCurrentDeviceActivity",
      "getNetworkConnection", "hideDeviceKeyboard", "installAppOnDevice", "isAppInstalledOnDevice", "launchApp", "lock",
      "openNotifications", "performMultiAction", "performTouchAction", "pullFileFromDevice", "pushFileToDevice",
      "removeAppFromDevice", "resetApp", "rotate", "setImmediateValueInApp", "setNetworkConnection", "shake",
      "toggleAirplaneModeOnDevice", "toggleDataOnDevice", "toggleLocationServicesOnDevice", "toggleWiFiOnDevice"
    ],
    "cookie": [
      "deleteCookie", "getCookie", "setCookie"
    ],
    "mobile": [
      "flick", "flickDown", "flickLeft", "flickRight", "flickUp", "getGeoLocation", "getOrientation", "hold", "release",
      "setGeoLocation", "setOrientation", "touch"
    ],
    "property": [
      "getAttribute", "getCssProperty", "getElementSize", "getHTML", "getLocation", "getLocationInView", "getSource",
      "getTagName", "getText", "getTitle", "getValue"
    ],
    "protocol": [
      "alertAccept", "alertDismiss", "alertText", "applicationCacheStatus", "back", "buttonDown", "buttonPress",
      "buttonUp", "cookie", "doDoubleClick", "element", "elementActive", "elementIdAttribute", "elementIdClear",
      "elementIdClick", "elementIdCssProperty", "elementIdDisplayed", "elementIdElement", "elementIdElements",
      "elementIdEnabled", "elementIdLocation", "elementIdLocationInView", "elementIdName", "elementIdSelected",
      "elementIdSize", "elementIdText", "elementIdValue", "elements", "execute", "executeAsync", "file", "forward",
      "frame", "frameParent", "imeActivate", "imeActivated", "imeActiveEngine", "imeAvailableEngines", "imeDeactivated",
      "implicitWait", "keys", "localStorage", "localStorageSize", "location", "log", "logTypes", "moveTo",
      "orientation", "refresh", "screenshot", "session", "sessionStorage", "sessionStorageSize", "sessions", "source",
      "status", "submit", "timeouts", "timeoutsAsyncScript", "timeoutsImplicitWait", "title", "touchClick",
      "touchDoubleClick", "touchDown", "touchFlick", "touchLongClick", "touchMove", "touchScroll", "touchUp", "url",
      "window", "windowHandle", "windowHandleMaximize", "windowHandlePosition", "windowHandleSize", "windowHandles"
    ],
    "state": [
      "isEnabled", "isExisting", "isSelected", "isVisible"
    ],
    "utility": [
      "call", "chooseFile", "end", "endAll", "pause", "saveScreenshot", "scroll", "uploadFile", "waitFor",
      "waitForChecked", "waitForEnabled", "waitForExist", "waitForSelected", "waitForText", "waitForValue",
      "waitForVisible"
    ],
    "window": [
      "close", "getCurrentTabId", "getTabIds", "getViewportSize", "newWindow", "setViewportSize", "switchTab"
    ]
  },
  skipLoggingCommands = ["screenshot", "saveScreenshot"];

logger.setLevel("INFO");
browserLogger.setLevel("TRACE");
clientLogger.setLevel("TRACE");
driverLogger.setLevel("TRACE");
serverLogger.setLevel("TRACE");

/**
 * Constructor
 */
var RobaDriver = function (config) {
  logger.trace("Creating new RobaDriver: ", config);

  // munge the config and defaults
  this.config = config || {};
  _.defaults(this.config, {
    desiredCapabilities: {
      browserName: "chrome"
    }
  });
  logger.debug("Driver Config: ", this.config);

  // fire up the driver
  var future = new Future();
  this.driver = webdriver.remote(this.config)
    .init(this.config, function(){
      logger.debug("Driver initialized");
      future.return();
    });
  future.wait();

  // wrap the webdriver functions in a custom futurized container
  logger.debug("Wrapping driver commands");
  var fDriver = this;
  fDriver.commandList = [];
  _.each(_.keys(commands), function(family){
    _.each(commands[family], function(command){
      if(fDriver.driver[command]){
        fDriver.commandList.push(command);
        fDriver[command] = function () {
          var commandArgs = arguments,
            args = _.map(_.keys(commandArgs), function(i){ return commandArgs["" + i];});
          logger.trace("Wrapper: ", command, ":", args);
          return this.command(command, args);
        }.bind(fDriver);
      } else {
        logger.error("Failed to wrap command: ", command);
        throw new Error("Failed to wrap command: " + command);
      }
    });
  });

  // setup an event listener for the end event
  this.driver.on("end", function(e) {
    logger.info("Driver has ended");
    if(fDriver.config.end){
      logger.debug("Calling configured end listener: ", e);
      fDriver.config.end();
    }
  }.bind(fDriver));

  logger.info("Init complete");
};

/**
 * Execute a webdriver command using futures
 * @param command
 * @param args
 * @returns {*}
 */
RobaDriver.prototype.command = function (command, args) {
  assert(command, "Command called with null command");

  args = args || [];
  logger.debug("Command called: ", command, args);

  // Create a future to make this synchronous
  var future = new Future();

  // add the callback to the arguments
  args.push(function(error, result){
    if(error) {
      logger.error("Error executing command [", command, "]: ", error);
      future.return([error]);
      //throw new Error(error);
    } else {
      // skip logging for some commands (screenshots, etc)
      if(!_.contains(skipLoggingCommands, command)){
        logger.debug("Command Result: ", result);
      } else {
        logger.debug("Command Returned Successfully");
      }
      if(result && result.value){
        future.return([null, result.value]);
      } else if(result && typeof result.value !== "undefined" && result.value !== ""){
        future.return([null, result.value]);
      } else {
        future.return([null, result]);
      }
    }
  });

  // try the command
  this.driver[command].apply(this.driver, args);

  // done
  var result = future.wait();

  // check for errors
  if(result[0]){
    throw new Error(result[0]);
  }
  logger.trace("Command complete");

  // wait a few ms between command to improve logging sequentiality
  this.wait(2);

  return result[1];
};


/**
 * Wait for a specified time
 * @param ms
 */
RobaDriver.prototype.wait = function (ms) {
  ms = ms || 1000;
  logger.trace("Waiting for ", ms, " ms");
  var future = new Future();
  setTimeout(function(){
    logger.trace("waiting timeout returned");
    future.return();
  }, ms);
  future.wait();
  logger.trace("future.wait() returned");
};

/**
 * End the driver and destroy the browser session
 */
RobaDriver.prototype.end = function () {
  logger.info("End called");
  var future = new Future();
  this.driver.end(function(){
    future.return();
  });
  future.wait();
  logger.debug("End complete");
};

/**
 * Save a screenshot
 */
RobaDriver.prototype.getScreenshot = function () {
  var filename = Date.now() + ".png",
    path = this.config.logPath + filename;
  logger.debug("getScreenshot: ", path);

  this.saveScreenshot(path);
  return path;
};

/**
 * Capture the current browser state
 */
RobaDriver.prototype.getState = function () {
  logger.debug("getState");
  var state = {},
    tmpPath = this.config.logPath;

  // get a screenshot
  if(tmpPath){
    var filename = Date.now() + ".png";
    logger.info("Screenshot: ", filename);
    logger.trace("Calling saveScreenshot");
    this.saveScreenshot(tmpPath + filename);

    // make sure the file exists
    if(fs.existsSync(tmpPath + filename)){
      logger.trace("Reading file");
      var data = fs.readFileSync(tmpPath + filename);
      logger.trace("Base64 encoding file");
      state.screenshot = new Buffer(data, "binary").toString("base64");
    } else {
      logger.error("Screenshot failed, file not found: ", filename);
    }
  }

  // get the current URL
  state.url = this.url();

  // get the current window size
  state.viewportSize = this.getViewportSize();

  // get the title
  state.title = this.title();

  // get the viewport scroll
  state.scroll = {
    x: this.execute(function () { return window.pageXOffset;}),
    y: this.execute(function () { return window.pageYOffset;})
  };

  // get the mouse position
  state.mouse = this.execute(function () { return roba_driver.mouse });

  // get the browser and selenium logs
  this.getClientLogs();

  return state;
};

/**
 * Fetch the client url silently
 */
RobaDriver.prototype.checkUrl = function () {
  var future = new Future();
  this.driver.url(function (error, result) {
    if(error){
      logger.error("Error checking url: ", error);
    }
    future.return(result ? result.value : null);
  });
  return future.wait();
};

/**
 * Retrieve the client logs via selenium
 * Log them directly to the appropriate log listeners
 * Circumvent the wrapped function to prevent cross-logging
 */
RobaDriver.prototype.getClientLogs = function () {
  this.fetchLogs("browser", browserLogger);
  //this.fetchLogs("client", clientLogger);
  this.fetchLogs("driver", driverLogger);
  this.fetchLogs("server", serverLogger);
};

/**
 * Retrieve the client logs via selenium
 * Log them directly to the appropriate log listeners
 * Circumvent the wrapped function to prevent cross-logging
 */
RobaDriver.prototype.fetchLogs = function (type, fetchLogger) {
  // fetch the browser logs
  var future = new Future();
  try {
    this.driver.log(type, function (error, result) {
      //fetchLogger.info("Log Messages: ", result);
      if(error){
        fetchLogger.error("Error fetching " + type + " log: ", error);
      } else if(result && result.value) {
        result.value.forEach(function (message) {
          if(message.message && message.level){
            //var logMsg = (message.timestamp ? "[" + message.timestamp + "] " : "" ) + message.message;
            var logMsg = message.message;
            switch (message.level.toLowerCase()) {
              case "severe":
                fetchLogger.error(logMsg, message);
                break;
              case "warn":
                fetchLogger.warn(logMsg);
                break;
              case "debug":
                fetchLogger.debug(logMsg);
                break;
              default:
                fetchLogger.info(logMsg);
                break;
            }
          } else {
            fetchLogger.info(message);
          }
        });
      } else {
        fetchLogger.info(result);
      }
      future.return();
    });
  } catch (e) {
    fetchLogger.error("Fetching " + type + " log failed: ", e);
  }
  future.wait();
};

/**
 * Inject some javascript code to help out occasionally
 */
RobaDriver.prototype.injectHelpers = function () {
  logger.trace("injectHelpers");
  this.execute(function () {
    if(typeof(roba_driver) == "undefined"){
      roba_driver = {};

      // observe the mouse position
      roba_driver.mouse = {x: 0, y: 0};
      document.addEventListener('mousemove', function(e){
        roba_driver.mouse.x = e.clientX || e.pageX;
        roba_driver.mouse.y = e.clientY || e.pageY
      }, false);

      // create a function for grabbing basic element information
      roba_driver.element_info = function (el, getText, getHtml) {
        try {
          // basics
          var info = {
            tag: el.tagName,
            attributes: [],
            bounds: el.getBoundingClientRect(),
            selectors: roba_driver.getSelectors(el)
          };

          // grab the attributes
          for(var i = 0; i < el.attributes.length; i++){
            info.attributes.push({name: el.attributes[i].name, value: el.attributes[i].value});
          }

          info.bounds.scrollY = window.pageYOffset;
          info.bounds.scrollX = window.pageXOffset;

          if(getText){ info.text = el.textContent; }
          if(getHtml){ info.html = el.outerHTML; }

          // targeted
          switch (el.tagName.toLowerCase()) {
            case "a":
              info.href = el.getAttribute("href");
              break;
          }

          // get the parent information
          if(el.parentNode){
            info.parent = roba_driver.element_info(el.parentNode, false, false);
            info.childIndex = Array.prototype.indexOf.call(el.parentNode.children, el);
          }

          return info;
        } catch (e) {
          return;
          //console.error("roba_driver.element_info failed: ", e);
          //return { message: "roba_driver.element_info failed", error: e }
        }
      };

      // get a list of elements from an xpath
      roba_driver.getElementsByXPath = function (xpath, base) {
        var iterator = document.evaluate(xpath, base || document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
        try {
          var elements = [],
            thisNode = iterator.iterateNext();

          while (thisNode) {
            elements.push(thisNode);
            thisNode = iterator.iterateNext();
          }
        } catch (e) {
          console.log("roba_driver.getElementsByXPath failed: ", e);
          return { message: "roba_driver.getElementsByXPath failed", error: e }
        }
        return elements;
      };

      // validate an xpath selector
      roba_driver.checkXpathSelector = function (selector, el) {
        var matchList = roba_driver.getElementsByXPath(selector, document);

        if(matchList.length == 1){
          return selector;
        } else if(matchList.length > 1) {
          var index = matchList.indexOf(el);
          if(index >= 0){
            selector = "(" + selector + ")[" + (index + 1) + "]";
            matchList = roba_driver.getElementsByXPath(selector, document);
            if(matchList.length == 1){
              return selector;
            }
          }
        }
      };

      // get a list of validated selectors for an element
      roba_driver.getSelectors = function (el) {
        if(el){
          var selectors = [], testSelector;

          // get the alternate selectors, starting with the id selector
          var id = el.getAttribute("id");
          if(id){
            testSelector = "//" + el.tagName + "[@id=\"" + id + "\"]";
            var result = roba_driver.checkXpathSelector(testSelector, el);
            if(result){
              selectors.push(result);
            }
          }

          // Check by class
          var cssClass = el.getAttribute("class");
          if(cssClass){
            var classList = cssClass.split(/\s/),
              classSelector = classList.map(function (className) {
                return "contains(@class, \"" + className.trim() + "\")"
              }).join(" and ");

            testSelector = "//" + el.tagName + "[" + classSelector + "]";
            var result = roba_driver.checkXpathSelector(testSelector, el);
            if(result){
              selectors.push(result);
            }
          }

          // Check by href
          var href = el.getAttribute("href");
          if(href){
            testSelector = "//" + el.tagName + "[@href=\"" + href + "\"]";
            var result = roba_driver.checkXpathSelector(testSelector, el);
            if(result){
              selectors.push(result);
            }
          }

          // Check by text
          var wordCount = el.textContent.split(/\s/).length;
          if(el.textContent.length && wordCount < 10){
            testSelector = "//" + el.tagName + "[text()=\"" + el.textContent + "\"]";
            var result = roba_driver.checkXpathSelector(testSelector, el);
            if(result){
              selectors.push(result);
            }
          }

          // return a list of selector objects for formatting
          return selectors.map(function (selector) {
            return {
              selector: selector,
              match: true,
              matchCount: 1
            }
          });
        }
      };

      return "roba_driver initialized";
    } else {
      return "roba_driver defined";
    }
  });
};

/**
 * Get the element that is foremost at a given location
 * @param x
 * @param y
 * @param highlight Should the element be highlighted
 * @param exclusive True|False Should current highlighting be cleared first
 * @returns {*}
 */
RobaDriver.prototype.getElementAtLocation = function (x, y, highlight, exclusive) {
  logger.debug("getElementAtLocation: ", x, y, highlight, exclusive);
  var result = this.execute(function (x, y, highlight, exclusive){
    var el = document.elementFromPoint(x, y);
    if(el){
      var info = { element: roba_driver.element_info(el, true, true) };
      if(highlight){
        info.highlightElements = [ info.element ];
      }
      return info;
    }
  }, x, y, highlight, exclusive);
  return result;
};

/**
 * Test out a selector by highlighting and returning the matches
 * @param selector The selector to "test" by returning all matched elements
 */
RobaDriver.prototype.testSelector = function (selector, getText, getHtml) {
  logger.debug("testSelector: ", selector);
  getText = _.isUndefined(getText) ? true : getText;
  getHtml = _.isUndefined(getHtml) ? true : getHtml;
  var result = this.execute(function (selector, getText, getHtml) {
    var elements = [],
      elementInfo = [];

    // route xPaths special
    if(selector.match(/^\/\//)){
      elements = roba_driver.getElementsByXPath(selector, document);
    } else {
      elements = document.querySelectorAll(selector);
    }

    // highlight each of the matches and gather basic info
    for(var i in elements){
      elementInfo.push(roba_driver.element_info(elements[i], getText, getHtml));
    }
    return { highlightElements: elementInfo };
  }, selector, getText, getHtml);
  return result;
};

/**
 * Clear the highlight status from all elements
 */
RobaDriver.prototype.clearHighlight = function () {
  logger.debug("clearHighlight");
  return { highlightElements: [] };
};

/**
 * Given a location, get the top level element at that location
 * and test the given selector
 * @param x
 * @param y
 * @param selector
 */
RobaDriver.prototype.refineSelector = function (x, y, selector) {
  logger.debug("refineSelector: ", x, y, selector);
  var result = this.execute(function (x, y, selector){
    var el = document.elementFromPoint(x, y);
    if(el){
      // test the given selector
      var elements = [];

      // check the selector if one was provided
      if(selector){
        // route xPaths special
        console.log("Checking selector: ", selector);
        if(selector.match(/^\/\//)){
          elements = roba_driver.getElementsByXPath(selector, document);
        } else {
          elements = document.querySelectorAll(selector);
        }
        console.log("Selector matched", elements ? elements.length : 0, "elements");
      }

      return {
        match: elements.length == 1,
        matchCount: elements.length,
        selector: selector,
        selectors: roba_driver.getSelectors(el)
      }
    }
  }, x, y, selector);

  // get the browser logs
  this.getClientLogs();

  return result;
};

/**
 * Given a location, get the top level element at that location
 * and determine a few different way to identify that node
 * @param x
 * @param y
 */
RobaDriver.prototype.getSelectors = function (x, y) {

};

/**
 * Get information for all of the elements affected by running a piece of codeRaw
 * @param codeRaw
 */
RobaDriver.prototype.previewCode = function (codeRaw, account, context) {
  // codeRaw should be base64 encoded
  var code = new Buffer(codeRaw, "base64").toString();
  logger.debug("previewCode: ", code, account, context);

  var preview = new RobaPreviewer(this, account, context);
  return preview.run(code);
};

/**
 * Turns whatever arguments passed into an assembled url
 * @returns {string} The assembled url built from whatever was passed
 */
RobaDriver.prototype.buildUrl = function () {
  var pieces = [], parts;
  _.each(arguments, function (argv) {
    if(_.isArray(argv)){
      _.each(argv, function (subargv) {
        if(subargv){
          parts = subargv.toString().replace(/^\//, "").replace(/\/$/, "").split(/\/(?!\/)/);
          _.each(parts, function (p) {
            pieces.push(p);
          });
        }
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
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaDriver;
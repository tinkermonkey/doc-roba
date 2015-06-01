/**
 * Basic futurized wrapper for webdriverio
 */

var Future        = require("fibers/future"),
  _               = require("underscore"),
  log4js          = require("log4js"),
  assert          = require("assert"),
  webdriver       = require("webdriverio"),
  fs              = require("fs"),
  logger          = log4js.getLogger("future-driver"),
  browserLogger   = log4js.getLogger("browser"),
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

logger.setLevel("DEBUG");


/**
 * Constructor
 */
var FutureDriver = function (config) {
  logger.trace("Creating new FutureDriver: ", config);

  // munge the config and defaults
  this.config = config || {};
  _.extend(this.config, {
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

  // wrap the webdriver class in futures
  logger.info("Wrapping driver commands");
  var fDriver = this;
  _.each(_.keys(commands), function(family){
    _.each(commands[family], function(command){
      if(fDriver.driver[command]){
        //logger.debug("Futurizing command: ", command, ", ", typeof fDriver.driver[command]);
        fDriver[command] = function () {
          var commandArgs = arguments,
            args = _.map(_.keys(commandArgs), function(i){ return commandArgs["" + i];});
          logger.trace("Wrapper: ", command, ":", args);
          try{
            return this.command(command, args);
          } catch (e) {
            logger.error("Exception executing command [" + command + "](", args,"): ", e ? e.toString() : "");
            logger.error(new Error(e.toString()).stack);
          }
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
FutureDriver.prototype.command = function (command, args) {
  assert(command, "Command called with null command");

  args = args || [];
  logger.debug("Command called: ", command, args);

  // Create a future to make this synchronous
  var future = new Future();

  // add the callback to the arguments
  args.push(function(error, result){
    if(error) {
      logger.error("Error executing command [", command, "]: ", error);
      future.return();
    } else {
      // skip logging for some commands (screenshots, etc)
      if(!_.contains(skipLoggingCommands, command)){
        logger.debug("Command Result: ", result);
      } else {
        logger.debug("Command Returned Successfully");
      }
      if(result && result.value){
        future.return(result.value);
      } else if(result && typeof result.value !== "undefined" && result.value !== ""){
        future.return(result.value);
      } else {
        future.return(result);
      }
    }
  });

  // try the command
  this.driver[command].apply(this.driver, args);

  // done
  var result = future.wait();
  logger.trace("Command complete");

  // wait a few ms between command to improve logging sequentiality
  this.wait(2);

  return result;
};


/**
 * Wait for a specified time
 * @param ms
 */
FutureDriver.prototype.wait = function (ms) {
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
FutureDriver.prototype.end = function () {
  logger.info("End called");
  var future = new Future();
  this.driver.end(function(){
    future.return();
  });
  future.wait();
  logger.debug("End complete");
};

/**
 * Capture the current browser state
 */
FutureDriver.prototype.getState = function (savePath) {
  assert(savePath, "getState called with null savePath");
  logger.debug("getState: ", savePath);
  var state = {};

  // get a screenshot
  if(savePath){
    var filename = Date.now() + ".png";
    logger.info("Screenshot: ", filename);
    logger.trace("Calling saveScreenshot");
    this.saveScreenshot(savePath + filename);

    // make sure the file exists
    if(fs.existsSync(savePath + filename)){
      logger.trace("Reading file");
      var data = fs.readFileSync(savePath + filename);
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
FutureDriver.prototype.checkUrl = function () {
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
FutureDriver.prototype.getClientLogs = function () {
  // fetch the browser logs
  var future = new Future();
  try {
    this.driver.log("browser", function (error, result) {
      if(error){
        browserLogger.error("Error fetching browser log: ", error);
      } else if(result && result.value) {
        result.value.forEach(function (message) {
          if(message.message && message.level){
            //var logMsg = (message.timestamp ? "[" + message.timestamp + "] " : "" ) + message.message;
            var logMsg = message.message;
            switch (message.level.toLowerCase()) {
              case "severe":
                browserLogger.error(logMsg, message);
                break;
              case "warn":
                browserLogger.warn(logMsg);
                break;
              case "debug":
                browserLogger.debug(logMsg);
                break;
              default:
                browserLogger.info(logMsg);
                break;
            }
          } else {
            browserLogger.info(message);
          }
        });
      } else {
        browserLogger.info(result);
      }
      future.return();
    });
  } catch (e) {
    logger.error("Fetching browser log failed: ", e);
  }
  future.wait();
};

/**
 * Inject some javascript code to help out occasionally
 */
FutureDriver.prototype.injectHelpers = function () {
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
            bounds: el.getBoundingClientRect()
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
            info.parent = roba_driver.element_info(el.parentNode, true, false);
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
FutureDriver.prototype.getElementAtLocation = function (x, y, highlight, exclusive) {
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
FutureDriver.prototype.testSelector = function (selector) {
  logger.debug("testSelector: ", selector);
  var result = this.execute(function (selector) {
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
      elementInfo.push(roba_driver.element_info(elements[i], true, true));
    }
    return { highlightElements: elementInfo };
  }, selector);
  return result;
};

/**
 * Clear the highlight status from all elements
 */
FutureDriver.prototype.clearHighlight = function () {
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
FutureDriver.prototype.refineSelector = function (x, y, selector) {
  logger.debug("refineSelector: ", x, y, selector);
  var result = this.execute(function (x, y, selector){
    var el = document.elementFromPoint(x, y);
    if(el){
      // test the given selector
      var elements = [], matchList = [], selectors = [],
        testSelector, index;

      // route xPaths special
      console.log("Checking selector: ", selector);
      if(selector.match(/^\/\//)){
        elements = roba_driver.getElementsByXPath(selector, document);
      } else {
        elements = document.querySelectorAll(selector);
      }
      console.log("Selector matched", elements ? elements.length : 0, "elements");

      // get the alternate selectors, starting with the id selector
      var id = el.getAttribute("id");
      if(id){
        testSelector = "//" + el.tagName + "[@id=" + id + "]";
        matchList = roba_driver.getElementsByXPath(testSelector, document);
        if(matchList.length == 1){
          selectors.push(testSelector);
        } else if(matchList.length > 1) {
          index = matchList.indexOf(el);
          if(index >= 0){
            testSelector = "(" + testSelector + ")[" + (index + 1) + "]";
            matchList = roba_driver.getElementsByXPath(testSelector, document);
            if(matchList.length == 1){
              selectors.push(testSelector);
            }
          }
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
        matchList = roba_driver.getElementsByXPath(testSelector, document);

        if(matchList.length == 1){
          selectors.push(testSelector);
        } else if(matchList.length > 1) {
          index = matchList.indexOf(el);
          if(index >= 0){
            testSelector = "(" + testSelector + ")[" + (index + 1) + "]";
            matchList = roba_driver.getElementsByXPath(testSelector, document);
            if(matchList.length == 1){
              selectors.push(testSelector);
            } else {
              console.error("Matched Elements failed final check: " + testSelector);
              console.error("Matched Elements failed final check: " + matchList.length);
            }
          }
        }
      }

      // Check by text
      var wordCount = el.textContent.split(/\s/).length;
      if(el.textContent.length && wordCount < 10){
        testSelector = "//" + el.tagName + "[text()=\"" + el.textContent + "\"]";
        matchList = roba_driver.getElementsByXPath(testSelector, document);

        if(matchList.length == 1){
          selectors.push(testSelector);
        } else if(matchList.length > 1) {
          index = matchList.indexOf(el);
          if(index >= 0){
            testSelector = "(" + testSelector + ")[" + (index + 1) + "]";
            matchList = roba_driver.getElementsByXPath(testSelector, document);
            if(matchList.length == 1){
              selectors.push(testSelector);
            } else {
              console.error("Matched Elements failed final check: " + testSelector);
              console.error("Matched Elements failed final check: " + matchList.length);
            }
          }
        }
      } else {
        console.log("Element had no text");
      }


      var attributes = [];
      for(var i = 0; i < el.attributes.length; i++){
        attributes.push({name: el.attributes[i].name, value: el.attributes[i].value});
      }
      // put together the list of selectors

      return {
        match: elements.length == 1,
        selector: selector,
        selectors: selectors,
        wordCount: el.textContent.split(/\s/).length,
        attributes: attributes,
        id: el.getAttribute("id"),
        css: el.getAttribute("class"),
        text: el.textContent
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
FutureDriver.prototype.getSelectors = function (x, y) {

};

/**
 * Turns whatever arguments passed into an assembled url
 * @returns {string} The assembled url built from whatever was passed
 */
FutureDriver.prototype.buildUrl = function () {
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
module.exports = FutureDriver;
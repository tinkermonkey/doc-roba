/**
 * Autocomplete shim which will be replaced with code module based autocomplete
 */
var futureDriverAutocomplete = {
  driver: [
    // action
    "addValue", "clearElement", "click", "doubleClick", "dragAndDrop", "leftClick", "middleClick", "rightClick",
    "selectorExecute", "selectorExecuteAsync", "setValue", "submitForm",

    // appium
    "backgroundApp", "closeApp", "context", "deviceKeyEvent", "getAppStrings", "getCurrentDeviceActivity",
    "getNetworkConnection", "hideDeviceKeyboard", "installAppOnDevice", "isAppInstalledOnDevice", "launchApp", "lock",
    "openNotifications", "performMultiAction", "performTouchAction", "pullFileFromDevice", "pushFileToDevice",
    "removeAppFromDevice", "resetApp", "rotate", "setImmediateValueInApp", "setNetworkConnection", "shake",
    "toggleAirplaneModeOnDevice", "toggleDataOnDevice", "toggleLocationServicesOnDevice", "toggleWiFiOnDevice",

    // cookie
    "deleteCookie", "getCookie", "setCookie",

    // mobile
    "flick", "flickDown", "flickLeft", "flickRight", "flickUp", "getGeoLocation", "getOrientation", "hold", "release",
    "setGeoLocation", "setOrientation", "touch",

    // property
    "getAttribute", "getCssProperty", "getElementSize", "getHTML", "getLocation", "getLocationInView", "getSource",
    "getTagName", "getText", "getTitle", "getValue",

    // protocol
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
    "window", "windowHandle", "windowHandleMaximize", "windowHandlePosition", "windowHandleSize", "windowHandles",

    // state
    "isEnabled", "isExisting", "isSelected", "isVisible",

    // utility
    "call", "chooseFile", "end", "endAll", "pause", "saveScreenshot", "scroll", "uploadFile", "waitFor",
    "waitForChecked", "waitForEnabled", "waitForExist", "waitForSelected", "waitForText", "waitForValue",
    "waitForVisible",

    // window
    "close", "getCurrentTabId", "getTabIds", "getViewportSize", "newWindow", "setViewportSize", "switchTab",

    // future-driver
    "clearHighlight", "testSelector", "getElementAtLocation", "highlighElementAtLocation", "getClientLogs", "wait"
  ]
};

// Update the key list
futureDriverAutocomplete.keys = _.keys(futureDriverAutocomplete);

/**
 * AceEditor autocomplete for driver functions
 * @type {{getCompletions: futureDriverCompleter.getCompletions}}
 */
export const RobaCompleter = {
  getCompletions: function (editor, session, pos, prefix, callback) {
    if (prefix.length === 0) { callback(null, []); return }

    var matches = [],
      line = session.getLine(pos.row).substring(0, pos.column),
      context = "",
      char = "",
      whitespaceFound = false,
      i = 0;

    while(i++ < line.length && !whitespaceFound){
      char = line.charAt(line.length - i);
      if(char.match(/\s/)){
        whitespaceFound = true;
      } else {
        context = line.charAt(line.length - i) + context;
      }
    }
    // sanitize
    context = context.replace(/[^a-z0-9\._]/ig, "_");

    // break it up
    var pieces = context.split(".");
    //console.log("futureDriverCompleter: ", pieces, line, pos, context);

    // see if it matches one of the top-level keys
    if(pieces.length == 1){
      //console.log("Checking keys: ", pieces[0]);
      _.each(futureDriverAutocomplete.keys, function (key) {
        //console.log("Check: ", pieces[0], key, key.match(pieces[0]));
        if(key.match(pieces[0])){
          matches.push(key);
        }
      });
      callback(null, matches.map(function (word) {
        return {name: word, value: word, score: 100, meta: "futureDriver"};
      }));
    } else {
      //console.log("Checking keys: ", pieces[0], futureDriverAutocomplete.keys, _.contains(futureDriverAutocomplete.keys, pieces[0]));
      if(_.contains(futureDriverAutocomplete.keys, pieces[0])){
        //console.log("Valid Key: ", pieces[0], futureDriverAutocomplete[pieces[0]].length);
        _.each(futureDriverAutocomplete[pieces[0]], function (word) {
          if(word.match(pieces[1])){
            matches.push(word);
          }
        });
        callback(null, matches.map(function (word) {
          return {name: word, value: word, score: 100, meta: "futureDriver"};
        }));
      }
    }
  }
};
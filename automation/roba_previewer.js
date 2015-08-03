/**
 * Previewer layer for syphoning selectors to provider dom information
 */
var Future  = require("fibers/future"),
  _         = require("underscore"),
  RobaReady = require("./roba_ready"),
  RobaValid = require("./roba_valid"),
  assert    = require("assert"),
  log4js    = require("log4js"),
  logger    = log4js.getLogger("previewer"),
  // block commands which might take it too far (leave the current page)
  blocked = {
    driver: [
      // action
      "click", "doubleClick", "leftClick", "middleClick", "rightClick", "submitForm",

      // appium
      "backgroundApp", "closeApp", "installAppOnDevice", "launchApp", "lock", "openNotifications",
      "removeAppFromDevice", "resetApp", "setNetworkConnection", "shake", "toggleAirplaneModeOnDevice",
      "toggleDataOnDevice", "toggleLocationServicesOnDevice", "toggleWiFiOnDevice",

      // protocol
      "back", "doDoubleClick", "forward", "submit", "url",

      // window
      "close", "newWindow", "switchTab"
    ],
    ready: [],
    valid: []
  };

logger.setLevel("TRACE");

/**
 * Create a new previewer checker
 * @constructor
 */
var RobaPreviewer = function (driver, account, context) {
  logger.debug("Creating Previewer");

  // can't function without a driver
  assert(driver, "RobaPreviewer called without a driver");

  // create the list of commands
  var previewer = this;
  previewer.commands    = [];
  previewer.real_driver = driver;
  previewer.real_ready  = new RobaReady(driver);
  previewer.real_valid  = new RobaValid(driver);
  previewer.account = account;
  previewer.context = context;

  // hook up the command listeners
  _.each(["driver", "ready", "valid"], function(actorName){
    previewer[actorName] = {};
    _.each(previewer["real_" + actorName].commandList, function(command){
      // check the blocked list
      logger.trace("Registering Previewer Command: ", actorName, command);
      previewer[actorName][command] = function () {
        logger.debug("Previewer Command called: ", actorName, command);
        var commandArgs = arguments,
          args = _.map(_.keys(commandArgs), function(i){ return commandArgs["" + i];});

        // store the command and the args
        if(args.length){
          previewer.commands.push({
            actor: actorName,
            command: command,
            args: args
          });
        }

        // run the real command if it's safe
        if(!_.contains(blocked[actorName], command)){
          return previewer["real_" + actorName][command].call(args);
        } else {
          logger.debug("Previewer Command blocked: ", actorName, command);
        }
      };
    });
  });

  return previewer;
};

/**
 * Perform the previewer
 */
RobaPreviewer.prototype.run = function (code) {
  logger.debug("Previewer.run: ", code);

  var previewer = this,
    realDriver = previewer.real_driver,
    driver = previewer.driver,
    ready  = previewer.ready,
    valid  = previewer.valid;

  // run the code
  try {
    var result = eval(code);
  } catch(e) {

  }

  // Get the elements used in the commands
  _.each(previewer.commands, function (command) {
    var selector = command.args[0];

    // get the elements for this selector
    command.matches = realDriver.testSelector(selector, false, false).highlightElements;
  });

  return previewer.commands;
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaPreviewer;
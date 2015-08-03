/**
 * Asynchronous page-valid checking that functions with the synchronous roba_driver
 */
var Future  = require("fibers/future"),
  _         = require("underscore"),
  assert    = require("assert"),
  log4js    = require("log4js"),
  logger    = log4js.getLogger("valid"),
  commands  = [
    "waitFor",
    "waitForChecked",
    "waitForEnabled",
    "waitForExist",
    "waitForSelected",
    "waitForText",
    "waitForValue",
    "waitForVisible"
  ];

logger.setLevel("DEBUG");

/**
 * Create a new valid checker
 * @constructor
 */
var RobaValid = function (driver, timeout) {
  logger.debug("Creating Valid Checker");

  // can't function without a driver
  assert(driver, "RobaValid called without a driver");

  // create the list of commands
  var valid = this;
  valid.commandList = [];
  valid.driver      = driver;
  valid.checks      = [];
  valid.timeout     = timeout || 5000;

  // hook up the command listeners
  _.each(commands, function(command){
    logger.trace("Registering Valid Check: ", command);
    valid.commandList.push(command);
    valid[command] = function () {
      logger.trace("Valid Command called: ", command);
      var commandArgs = arguments,
        args = _.map(_.keys(commandArgs), function(i){ return commandArgs["" + i];});

      valid.checks.push({
        command: command,
        args: args
      });
    }.bind(valid);
  });

  return valid;
};

/**
 * Perform the actual valid checks
 */
RobaValid.prototype.check = function () {
  logger.debug("Valid Checker Running");

  // make sure there are checks to run
  if(!this.checks.length){
    logger.trace("Valid.check called with no checks");
    return true;
  }

  var valid = this,
    driver = valid.driver.driver,
    future = new Future(),
    startTime = Date.now(),
    allPass = true,
    checksReturned = 0;

  // run the checks
  logger.trace("Valid Checker running checks");
  _.each(valid.checks, function (check, i) {
    var args = check.args;
    args.push(valid.timeout);
    args.push(function (error, result) {
      // log the result
      allPass = allPass && result;
      check.result = {
        pass: result,
        time: Date.now() - startTime,
        timeout: valid.timeout
      };

      if(error){
        logger.error("Check returned: ", i, checksReturned, check.result);
        check.result.error = error;
      } else {
        logger.trace("Check returned: ", i, checksReturned, check.result);
      }

      // check for completion
      checksReturned++;
      if(checksReturned == valid.checks.length){
        future.return();
      }
    });
    logger.debug("Valid Check Command setup: ", check.command, check.args[0]);
    driver[check.command].apply(driver, args);
  });

  // wait for the checks to return
  logger.trace("Valid Checker waiting for checks");
  future.wait();

  // make sure everything passed
  logger.debug("Valid Checker complete: ", allPass);
  return allPass;
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaValid;
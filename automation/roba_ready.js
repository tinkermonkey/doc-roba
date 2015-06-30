/**
 * Asynchronous page-ready checking that functions with the synchronous roba_driver
 */
var Future  = require("fibers/future"),
  _         = require("underscore"),
  assert    = require("assert"),
  log4js    = require("log4js"),
  logger    = log4js.getLogger("runner"),
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

/**
 * Create a new ready checker
 * @constructor
 */
var RobaReady = function (driver, timeout) {
  logger.info("Creating Ready Checker");

  // can't function without a driver
  assert(driver, "RobaReady called without a driver");

  // create the list of commands
  var ready = this;
  ready.driver    = driver;
  ready.checks    = [];
  ready.timeout   = timeout || 5000;

  // hook up the command listeners
  _.each(commands, function(command){
    logger.trace("Registering Ready Check: ", command);
    ready[command] = function () {
      logger.trace("Ready Command called: ", command);
      var commandArgs = arguments,
        args = _.map(_.keys(commandArgs), function(i){ return commandArgs["" + i];});

      ready.checks.push({
        command: command,
        args: args
      });
    }.bind(ready);
  });

  return ready;
};

/**
 * Perform the actual ready checks
 */
RobaReady.prototype.check = function () {
  logger.debug("Ready Checker Running");

  // make sure there are checks to run
  if(!this.checks.length){
    return true;
  }

  var ready = this,
    driver = ready.driver.driver,
    future = new Future(),
    startTime = Date.now(),
    allPass = true,
    checksReturned = 0;

  // run the checks
  logger.trace("Ready Checker running checks");
  _.each(ready.checks, function (check, i) {
    var args = check.args;
    args.push(ready.timeout);
    args.push(function (error, result) {
      // log the result
      allPass = allPass && result;
      check.result = {
        pass: result,
        time: Date.now() - startTime,
        timeout: ready.timeout
      };

      if(error){
        logger.debug("Check returned: ", i, checksReturned, check.result);
        check.result.error = error;
      } else {
        logger.trace("Check returned: ", i, checksReturned, check.result);
      }

      // check for completion
      checksReturned++;
      if(checksReturned == ready.checks.length){
        future.return();
      }
    });
    logger.debug("Ready Check Command: ", check.command, check.args[0]);
    driver[check.command].apply(driver, args);
  });

  // wait for the checks to return
  logger.trace("Ready Checker waiting for checks");
  future.wait();

  // make sure everything passed
  logger.debug("Ready Checker complete: ", allPass);
  return allPass;
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaReady;
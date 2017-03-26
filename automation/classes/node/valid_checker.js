"use strict";

let Future   = require("fibers/future"),
    _        = require("underscore"),
    assert   = require("assert"),
    log4js   = require("log4js"),
    logger   = log4js.getLogger("valid"),
    commands = [
      "isVisible"
    ];

logger.setLevel("TRACE");

class ValidChecker {
  /**
   * ValidChecker
   * @param driver
   * @param timeout
   * @return {ValidChecker}
   */
  constructor (driver, timeout) {
    logger.debug("Creating Valid Checker");
    
    // can't function without a driver
    assert(driver, "ValidChecker called without a driver");
    
    // create the list of commands
    let valid         = this;
    valid.commandList = [];
    valid.driver      = driver;
    valid.checks      = [];
    valid.timeout     = timeout || 5000;
    
    // hook up the command listeners
    commands.forEach((command) => {
      logger.trace("Registering Valid Check: ", command);
      valid.commandList.push(command);
      valid[ command ] = function () {
        logger.trace("Valid Command called: ", command);
        let commandArgs = arguments,
            args        = _.map(_.keys(commandArgs), function (i) {
              return commandArgs[ "" + i ];
            });
        
        valid.checks.push({
          command: command,
          args   : args
        });
      }.bind(valid);
    });
    
    return valid;
  }
  
  /**
   * Perform the validation checks
   */
  check () {
    logger.debug("Valid Checker Running");
    
    // make sure there are checks to run
    if (!this.checks.length) {
      logger.trace("Valid.check called with no checks");
      return true;
    }
    
    let valid          = this,
        driver         = valid.driver.driver,
        future         = new Future(),
        startTime      = Date.now(),
        allPass        = true,
        checksReturned = 0;
    
    // run the checks
    logger.trace("Valid Checker running checks");
    valid.checks.forEach((check, i) => {
      let args = check.args;
      args.push(valid.timeout);
      args.push((error, result) => {
        // If it's an array, reduce it to a scalar where one result has to be positive
        if(_.isArray(result)){
          let resultList = result;
          result = resultList.reduce((acc, value) => { return acc || value}, false);
          logger.trace("Check returned an array of values:", resultList, "that were reduced down to a scalar:", result);
        }
        
        // log the result
        allPass      = allPass && result;
        check.result = {
          pass   : result,
          time   : Date.now() - startTime,
          timeout: valid.timeout
        };
        
        if (error) {
          logger.error("Check returned: ", i, checksReturned, check.result);
          check.result.error = error;
        } else {
          logger.trace("Check returned: ", i, checksReturned, check.result, check.command, check.args);
        }
        
        // check for completion
        checksReturned++;
        if (checksReturned === valid.checks.length) {
          future.return();
        }
      });
      logger.debug("Valid Check Command setup: ", check.command, check.args[ 0 ]);
      driver[ check.command ].apply(driver, args);
    });
    
    // wait for the checks to return
    logger.trace("Valid Checker waiting for checks");
    future.wait();
    
    // make sure everything passed
    logger.debug("Valid Checker complete: ", allPass);
    return allPass;
  }
}

module.exports = ValidChecker;
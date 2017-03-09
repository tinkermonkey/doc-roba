"use strict";

var Future   = require("fibers/future"),
    _        = require("underscore"),
    assert   = require("assert"),
    log4js   = require("log4js"),
    logger   = log4js.getLogger("ready"),
    commands = [
      "waitFor",
      "waitForChecked",
      "waitForEnabled",
      "waitForExist",
      "waitForSelected",
      "waitForText",
      "waitForValue",
      "waitForVisible"
    ];

logger.setLevel("TRACE");

class ReadyChecker {
  /**
   * ReadyChecker
   * @param driver
   * @param timeout
   * @return {ReadyChecker}
   */
  constructor (driver, timeout) {
    logger.debug("Creating ready checker");
    
    // can't function without a driver
    assert(driver, "ReadyChecker requires a driver");
    
    // create the list of commands
    var ready         = this;
    ready.commandList = [];
    ready.driver      = driver;
    ready.checks      = [];
    ready.timeout     = timeout || 5000;
    
    // hook up the command listeners
    _.each(commands, function (command) {
      logger.trace("Registering Ready Check: ", command);
      ready.commandList.push(command);
      ready[ command ] = function () {
        logger.debug("Ready Command called: ", command);
        var commandArgs = arguments,
            args        = _.map(_.keys(commandArgs), function (i) {
              return commandArgs[ "" + i ];
            });
        
        ready.checks.push({
          command: command,
          args   : args
        });
      };
    });
    
    return ready;
  }
  
  /**
   * Perform the ready checks
   */
  check () {
    // make sure there are checks to run
    if (!this.checks.length) {
      logger.trace("Ready.check called with no checks");
      return true;
    }
    
    var ready          = this,
        driver         = ready.driver.driver,
        future         = new Future(),
        startTime      = Date.now(),
        allPass        = true,
        checksReturned = 0,
        result;
    
    // run the checks
    logger.debug("Running ready checks");
    _.each(ready.checks, function (check, i) {
      var args = check.args;
      args.push(ready.timeout);
      args.push(function (error, result) {
        // log the result
        allPass      = allPass && result;
        check.result = {
          pass   : result,
          time   : Date.now() - startTime,
          timeout: ready.timeout
        };
        
        if (error) {
          logger.error("Check returned error: ", i, checksReturned, check.result, error);
          check.result.error = error;
        } else {
          logger.trace("Check returned: ", i, checksReturned, check.result);
        }
        
        // check for completion
        checksReturned++;
        if (checksReturned == ready.checks.length) {
          future.return();
        }
      });
      
      logger.debug("Ready Check Command setup: ", check.command, check.args[ 0 ]);
      driver[ check.command ].apply(driver, args);
    });
    
    // wait for the checks to return
    logger.trace("Ready Checker waiting for checks");
    future.wait();
    
    // make sure everything passed
    logger.debug("Ready Checker complete: ", allPass);
    return allPass;
  }
}

module.exports = ReadyChecker;
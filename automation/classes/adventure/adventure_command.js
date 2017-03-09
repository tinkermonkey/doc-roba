"use strict";

var log4js       = require('log4js'),
    logger       = log4js.getLogger('adventure'),
    CodeExecutor = require('../code_executor/code_executor.js'),
    AdventureStepStatus;

class AdventureCommand {
  /**
   * AdventureCommand
   * @param record
   * @param index
   * @param adventure
   */
  constructor (record, index, adventure) {
    logger.debug('Creating adventure command:', index, record._id);
    this.record    = record;
    this.index     = index;
    this.adventure = adventure;
  }
  
  /**
   * Execute the command
   */
  execute () {
    logger.debug('Executing adventure command:', this.index, this.record._id);
    var command   = this,
        adventure = command.adventure,
        executor  = new CodeExecutor(command.record.code),
        result;
  
    // Inject the helpers
    adventure.driver.injectHelpers();
    
    // Update the logging context
    adventure.context.update({ adventureCommandId: command.record._id }); // each step handler should further update the context
    adventure.context.milestone({ type: "command", data: command.record });
  
    // Setup the execution context
    executor.addVariable("driver", adventure.driver);
    
    // Execute the code
    result = executor.execute();
    
    // Restore the logging context
    adventure.context.restore();
    
    // Save the command result
    logger.debug("Command executed:", result);
    if(result.error){
      command.setStatus(AdventureStepStatus.error, result.error)
    } else {
      command.setStatus(AdventureStepStatus.complete, result.result)
    }
  }
  
  /**
   * Set the step status
   * @param status
   * @param result
   */
  setStatus (status, result) {
    this.adventure.serverLink.call('setCommandStatus', [ this.record._id, status, result ])
  }
  
  /**
   * Grab any enums needed, pass them around
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('AdventureCommand.setEnums:', enums);
    AdventureStepStatus = enums.AdventureStepStatus;
  }
  
}

module.exports = AdventureCommand;
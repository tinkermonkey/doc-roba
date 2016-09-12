import { AdventureCommands } from '../../../imports/api/adventure/adventure_command.js';
import { AdventureStepStatus } from '../../../imports/api/adventure/adventure_step_status.js';
import { Util } from '../../../imports/api/util.js';
let commandTimeout = 10000;

export class AdventureAssistant {
  /**
   * AdventureAssistant
   */
  constructor () {
    
  }
  
  /**
   * Execute a command
   * @param adventure
   * @param commandCode
   * @param callback
   * @param updateState
   */
  executeCommand(adventure, commandCode, callback, updateState){
    console.log("AdventureAssistant.execute:", adventure.projectId, adventure._id, commandCode, updateState);
    
    // Create a command
    let startTime = Date.now(),
        commandId = AdventureCommands.insert({
          projectId  : adventure.projectId,
          adventureId: adventure._id,
          updateState: updateState == undefined ? true : updateState,
          code       : commandCode
        }, (error, result) => {
          // Cancel the watchdog timer
          clearTimeout(commandTimeoutId);
      
          if (error) {
            callback && callback(error);
          }
        });
    
    // Observe the record
    console.log("AdventureAssistant.execute observing command", commandId, "for", commandTimeout, "ms");
    var commandObserver = AdventureCommands.find({ _id: commandId }).observeChanges({
      changed(id, fields){
        // When the command is complete, call the callback and stop observing
        if (fields.status && _.contains([ AdventureStepStatus.complete, AdventureStepStatus.error ], fields.status)) {
          let endTime = Date.now();
          console.log("AdventureAssistant complete, stopping observation and calling callback after", endTime - startTime, "ms");
          commandObserver.stop();
          callback && callback(null, AdventureCommands.findOne({ _id: commandId }));
        }
      }
    });
    
    // Timeout if the command hasn't returned in time
    var commandTimeoutId = setTimeout(() => {
      let command = AdventureCommands.findOne({ _id: commandId });
      if (command) {
        if (_.contains([ AdventureStepStatus.complete, AdventureStepStatus.error ], command.status)) {
          console.error("AdventureAssistant watchdog found complete command, watchdog should have been cancelled");
        } else {
          AdventureCommands.update({ _id: commandId }, {
            $set: {
              status: AdventureStepStatus.error,
              result: {
                error: "Command timed out after " + commandTimeout + " ms"
              }
            }
          });
        }
      } else {
        console.error("AdventureAssistant watchdog timeout didn't find the command:", commandId);
      }
    }, commandTimeout);
    
    return commandId;
  }
  
  /**
   * Get the element at a location
   * @param adventure
   * @param x
   * @param y
   * @param callback
   */
  getElementAtLocation(adventure, x, y, callback){
    console.log("AdventureAssistant.getElementAtLocation:", adventure.projectId, adventure._id, x, y);
    let commandCode = "driver.getElementAtLocation(" + x + "," + y + ", true, true);";
    this.executeCommand(adventure, commandCode, (error, command) => {
      callback && callback(error, command);
    }, false );
  
  }
  
  /**
   * Try to automatically refine a selector
   * @param adventure
   * @param x
   * @param y
   * @param selector
   * @param callback
   */
  refineSelector(adventure, x, y, selector, callback){
    let commandCode = "driver.refineSelector(" + x + ", " + y + ", \"" + Util.escapeDoubleQuotes(selector) + "\");";
    this.executeCommand(adventure, commandCode, (error, command) => {
      callback && callback(error, command);
    }, false );
  }
  
  /**
   * Test a selector
   * @param adventure
   * @param selector
   * @param callback
   */
  testSelector(adventure, selector, callback){
    let commandCode = "driver.testSelector(\"" + Util.escapeDoubleQuotes(selector) + "\");";
    this.executeCommand(adventure, commandCode, (error, command) => {
      callback && callback(error, command);
    }, false );
  }
  
  /**
   * Hover over an element
   * @param adventure
   * @param selector
   * @param callback
   */
  hoverElement(adventure, selector, callback){
    let commandCode = "var el = driver.element(\"" + selector + "\");\n driver.moveTo(el.ELEMENT);";
    this.executeCommand(adventure, commandCode, (error, command) => {
      callback && callback(error, command);
    }, false );
  }
  
  /**
   * Set a value in an input
   * @param adventure
   * @param selector
   * @param value
   * @param callback
   */
  setValue(adventure, selector, value, callback){
    let commandCode = "driver.setValue(\"" + selector + "\", \"" + value + "\");";
    this.executeCommand(adventure, commandCode, (error, command) => {
      callback && callback(error, command);
    }, false );
  }
}
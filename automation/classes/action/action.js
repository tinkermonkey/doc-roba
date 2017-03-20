'use strict';

var log4js       = require('log4js'),
    logger       = log4js.getLogger('adventure'),
    CodeExecutor = require('../code_executor/code_executor.js');

class Action {
  /**
   * Action
   * @param actionId
   * @param projectId
   * @param serverLink
   */
  constructor (actionId, projectId, projectVersionId, serverLink) {
    logger.debug('Creating action:', actionId);
    this._id              = actionId;
    this.projectId        = projectId;
    this.projectVersionId = projectVersionId;
    this.serverLink       = serverLink;
  }
  
  /**
   * Load the records for this action
   * @return {Node}
   */
  init () {
    logger.debug('Initializing action:', this._id);
    var action = this;
    
    // Load the action record
    action.record = action.serverLink.liveRecord('action', [ action.projectId, action.projectVersionId, action._id ], 'actions');
    if (!action.record) {
      throw new Error("Failed to load action " + action._id);
    }
    
    // Create the code executor
    action.executor = new CodeExecutor(action.record.code);
    
    return this;
  }
  
  /**
   * Take this action
   * @param driver The driver to use
   * @param dataContext The top-level data context from the adventure or test role
   */
  execute (driver, dataContext) {
    logger.debug('Executing action:', this._id, this.record.title);
    var action = this;
    
    // Add the core variables
    action.executor.addVariable('driver', driver);
    action.executor.addVariable('dataContext', dataContext);
    
    // Add the action variables
    if(action.record.variables){
      action.record.variables.forEach(function (variable) {
        action.executor.addVariable(variable.name, dataContext && dataContext[ variable.name ], variable.defaultValue);
      });
    }
    
    // Execute the code
    action.executor.execute();
    
    logger.debug("Action complete");
  }
  
  /**
   * Add a context variable for the action code
   * @param name
   * @param value
   * @param defaultValue
   */
  addVariable (name, value, defaultValue) {
    this.executor.addVariable(name, value, defaultValue);
  }
}

module.exports = Action;
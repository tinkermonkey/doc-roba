'use strict';

var log4js = require('log4js'),
    logger = log4js.getLogger('adventure');

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
    
    return this;
  }
  
  /**
   * Take this action
   */
  execute () {
    logger.debug('Executing action:', this._id, this.record.title);
    var action = this;
  }
  
  /**
   * Grab any enums needed, pass them around
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('Action.setEnums:', enums);
  }
}

module.exports = Action;
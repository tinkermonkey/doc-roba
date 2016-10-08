"use strict";

var AdventureStepStatus,
    log4js = require('log4js'),
    logger = log4js.getLogger('adventure');

class AdventureStep {
  /**
   * AdventureCommand
   * @param record Adventure step record
   * @param index This step's index in the step list
   * @param adventure Parent adventure object
   */
  constructor (record, index, adventure) {
    logger.debug('Creating adventure step:', index, record._id);
    this.index     = index;
    this.record    = record;
    this.adventure = adventure;
  }
  
  /**
   * Initialize the step
   * @return {AdventureStep}
   */
  init () {
    logger.debug('Initializing step:', this.index, this.record._id);
    var step       = this,
        serverLink = step.adventure.serverLink;
    
    // Load the node for this step
    step.node = serverLink.liveRecord('node', [ step.record.projectId, step.record.projectVersionId, step.record.nodeId ]);
    
    // Load the action for this step if there is one
    if(step.record.actionId){
      step.action = serverLink.liveRecord('action', [ step.record.projectId, step.record.projectVersionId, step.record.actionId ]);
    }
    
    // Set the status to queued
    step.setStatus(AdventureStepStatus.queued);
    
    return this;
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('Executing step:', this.index, this.record._id);
    var step = this;
    
    // Set the status to queued
    step.setStatus(AdventureStepStatus.running);
    
  }
  
  /**
   * Skip this step
   */
  skip () {
    logger.debug('Skipping step:', this.index, this.record._id);
    var step = this;
    
    // Set the status to queued
    step.setStatus(AdventureStepStatus.skipped);
  }
  
  /**
   * Set the step status
   * @param status
   */
  setStatus (status) {
    this.adventure.serverLink.call('setAdventureStepStatus', [ this.record._id, status ])
  }
  
  /**
   * Set the
   * @param value
   */
  static setStatusEnum (value) {
    logger.trace('AdventureStep.setStatusEnum:', value);
    AdventureStepStatus = value;
  }
}

module.exports = AdventureStep;
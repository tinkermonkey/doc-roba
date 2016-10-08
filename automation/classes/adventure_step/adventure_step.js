"use strict";

var Action = require('../action/action.js'),
    Node   = require('../node/node.js'),
    log4js = require('log4js'),
    logger = log4js.getLogger('adventure'),
    AdventureStepStatus;

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
    var step            = this,
        adventureRecord = step.adventure.record;
    
    // Load the node for this step
    step.node = new Node(step.record.nodeId, adventureRecord.projectId, adventureRecord.projectVersionId, step.adventure.serverLink);
    step.node.init();
    
    // Load the action for this step if there is one
    if (step.record.actionId) {
      step.action = new Action(step.record.actionId, adventureRecord.projectId, adventureRecord.projectVersionId, step.adventure.serverLink);
      step.action.init();
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
    var step      = this,
        adventure = this.adventure,
        context   = adventure.context,
        driver    = adventure.driver,
        passed    = true;
    
    // Set the status to running
    step.setStatus(AdventureStepStatus.running);
    
    // Restore the context from a previous step
    context.restore();
    context.update({ adventureStepId: step.record._id });
    context.milestone({ type: "step", data: step.record });
    logger.info("Executing route step", step.index);
    
    // Check to see if the adventure is paused
    adventure.checkForPause();
    
    // If this is the first step then we need to bootstrap the browser to the url
    if (step.index == 0) {
      var startingPoint = driver.buildUrl(adventure.testServer.url, step.node.record.url);
      logger.debug("Step 0, navigating to starting point:", startingPoint);
      driver.url(startingPoint);
      driver.wait(1000);
    }
    
    // Inject the helpers
    driver.injectHelpers();
    
    // Update the adventure state
    adventure.updateState();
    
    // Validate the node
    logger.debug("Validating step node:", step.record.nodeId, step.node.record.title);
    passed = step.node.validate();
    
    // Take the action if there is one
    if (step.action) {
      logger.debug("Taking step action:", step.record.actionId, step.action.record.title);
      step.action.execute();
    }
    
    // Set the status
    step.setStatus(passed ? AdventureStepStatus.complete : AdventureStepStatus.error);
    
    return passed
  }
  
  /**
   * Skip this step
   */
  skip () {
    logger.debug('Skipping step:', this.index, this.record._id);
    var step = this;
    
    // Set the status to skipped
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
   * Grab any enums needed, pass them around
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('AdventureStep.setEnums:', enums);
    AdventureStepStatus = enums.AdventureStepStatus;
    
    Action.setEnums(enums);
    Node.setEnums(enums);
  }
}

module.exports = AdventureStep;
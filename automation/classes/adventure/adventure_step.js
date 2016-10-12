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
        result    = {
          ready: false,
          valid: false
        };
    
    // Set the status to running
    step.setStatus(AdventureStepStatus.running);
    
    // Restore the context from a previous step
    context.restore();
    context.update({ adventureStepId: step.record._id });
    context.milestone({ type: "step", data: step.record });
    logger.info("Executing route step", step.index);
    
    // If this is the first step then we need to bootstrap the browser to the url
    if (step.index == 0) {
      logger.debug("Step 0, navigating to starting point:", {
        serverUrl: adventure.testServer && adventure.testServer.url,
        nodeUrl  : step.node.record && step.node.record.url
      });
      var startingPoint = driver.buildUrl(adventure.testServer.url, step.node.record.url);
      driver.url(startingPoint);
      driver.wait(1000);
    }
    
    // Inject the helpers
    driver.injectHelpers();
    
    // Update the adventure state
    adventure.updateState(true);
    
    // Validate the node
    logger.debug("Validating step [", step.index, "] node");
    step.node.addVariable('account', adventure.record.dataContext.account);
    result.ready = step.node.checkReady(adventure.driver, adventure.record.dataContext[ 'step' + step.index ]);
    adventure.updateState(true);
    result.valid = step.node.validate(adventure.driver, adventure.record.dataContext[ 'step' + step.index ]);
    
    // Take the action if there is one
    if (result.ready.pass && result.valid.pass && step.action) {
      logger.debug("Taking step [", step.index, "] action");
      step.action.addVariable('account', adventure.record.dataContext.account);
      step.action.execute(adventure.driver, adventure.record.dataContext[ 'step' + step.index ]);
      adventure.updateState(true);
    }
    
    // Set the status and store the result
    step.setStatus(result.ready.pass && result.valid.pass ? AdventureStepStatus.complete : AdventureStepStatus.error, result);
    step.saveResult(result);
    
    // Pass back the overall status
    logger.debug("Taking step complete:", result.ready.pass && result.valid.pass ? "still healthy" : "step failed", result);
    return result.ready.pass && result.valid.pass
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
   * Save the step result
   * @param result
   */
  saveResult (result) {
    this.adventure.serverLink.call('saveAdventureStepResult', [ this.record._id, result ])
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
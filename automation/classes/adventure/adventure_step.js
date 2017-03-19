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
    let self            = this,
        adventureRecord = self.adventure.record;
    
    // Load the node for this step
    self.node = new Node(self.record.nodeId, adventureRecord.projectId, adventureRecord.projectVersionId, self.adventure.serverLink);
    self.node.init();
    
    // Load the action for this step if there is one
    if (self.record.actionId) {
      self.action = new Action(self.record.actionId, adventureRecord.projectId, adventureRecord.projectVersionId, self.adventure.serverLink);
      self.action.init();
    }
    
    // Set the status to queued
    self.setStatus(AdventureStepStatus.queued);
    
    return this;
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('Executing step:', this.index, this.record._id);
    let self      = this,
        adventure = this.adventure,
        context   = adventure.context,
        driver    = adventure.driver,
        result    = {
          ready: false,
          valid: false
        };
    
    // Set the status to running
    self.setStatus(AdventureStepStatus.running);
    
    // Restore the context from a previous step
    context.restore();
    context.update({ adventureStepId: self.record._id });
    context.milestone({ type: "step", data: self.record });
    logger.info("Executing route step", self.index);
    
    // If this is the first step then we need to bootstrap the browser to the url
    if (self.index == 0) {
      logger.debug("Step 0, navigating to starting point:", {
        serverUrl: adventure.testServer && adventure.testServer.url,
        nodeUrl  : self.node.record && self.node.record.url
      });
      driver.url(driver.buildUrl(adventure.testServer.url, self.node.record.url));
      driver.wait(1000);
    }
    
    // Inject the helpers
    driver.injectHelpers();
    
    // Update the adventure state
    adventure.updateState(true);
    
    // Validate the node
    logger.debug("Validating step [", self.index, "] node");
    self.node.addVariable('account', adventure.record.dataContext.account);
    result.ready = self.node.checkReady(adventure.driver, adventure.record.dataContext[ 'step' + self.index ]);
    adventure.updateState(true);
    result.valid = self.node.validate(adventure.driver, adventure.record.dataContext[ 'step' + self.index ]);
    
    // Take the action if there is one
    if (result.ready.pass && result.valid.pass && self.action) {
      logger.debug("Taking step [", self.index, "] action");
      self.action.addVariable('account', adventure.record.dataContext.account);
      self.action.execute(adventure.driver, adventure.record.dataContext[ 'step' + self.index ]);
      adventure.updateState(true);
    }
    
    // Set the status and store the result
    self.setStatus(result.ready.pass && result.valid.pass ? AdventureStepStatus.complete : AdventureStepStatus.error, result);
    self.saveResult(result);
    
    // Pass back the overall status
    logger.debug("Taking step complete:", result.ready.pass && result.valid.pass ? "still healthy" : "step failed", result);
    return result.ready.pass && result.valid.pass
  }
  
  /**
   * Skip this step
   */
  skip () {
    logger.debug('Skipping step:', this.index, this.record._id);
    
    // Set the status to skipped
    this.setStatus(AdventureStepStatus.skipped);
  }
  
  /**
   * Set the step status
   * @param status
   */
  setStatus (status) {
    this.adventure.serverLink.setAdventureStepStatus(this.record._id, status)
  }
  
  /**
   * Save the step result
   * @param result
   */
  saveResult (result) {
    this.adventure.serverLink.saveAdventureStepResult(this.record._id, result)
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
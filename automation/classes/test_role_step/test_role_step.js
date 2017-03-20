"use strict";

let Action            = require('../action/action.js'),
    Node              = require('../node/node.js'),
    log4js            = require('log4js'),
    logger            = log4js.getLogger('test_result_role'),
    ScreenshotKeys    = require('../enum/screenshot_keys.js'),
    TestCaseStepTypes = require('../enum/test_case_step_types.js'),
    TestResultStatus  = require('../enum/test_result_status.js'),
    TestResultCodes   = require('../enum/test_result_codes.js');

class TestRoleStep {
  /**
   * AdventureCommand
   * @param record Adventure step record
   * @param index This step's index in the step list
   * @param testRole Parent TestRole object
   */
  constructor (record, index, testRole) {
    logger.debug('Creating TestRoleStep:', index, record._id);
    this.index    = index;
    this.record   = record;
    this.testRole = testRole;
  }
  
  /**
   * Initialize the step
   */
  init () {
    logger.debug('TestRoleStep.init:', this.index, this.record._id);
    let self = this;
    
    // Set the status to queued
    self.setStatus(TestResultStatus.queued);
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('Executing step:', this.index, this.record._id);
    let self     = this,
        testRole = this.testRole,
        context  = testRole.context,
        driver   = testRole.driver;
    
    // Set the status to running
    self.setStatus(TestResultStatus.running);
    
    // Restore the context from a previous step
    context.restore();
    context.update({ testRoleStepId: self.record._id });
    context.milestone({ type: "step", data: self.record });
    logger.info("Executing TestRoleStep", self.index);
    
    // If this is the first step then we need to bootstrap the browser to the url
    if (self.index == 0) {
      logger.debug("Step 0, navigating to starting point:", {
        serverUrl: testRole.testServer && testRole.testServer.url,
        nodeUrl  : self.node.record && self.node.record.url
      });
      driver.url(driver.buildUrl(testRole.testServer.url, self.node.record.url));
      driver.wait(1000);
    }
    
    // Inject the helpers
    driver.injectHelpers();
  }
  
  /**
   * Process the result of execution
   */
  processResult () {
    
  }
  
  /**
   * Skip this step
   */
  skip () {
    logger.debug('TestResultRole.skip:', this.index, this.record._id);
    this.setStatus(TestResultStatus.skipped);
  }
  
  /**
   * Set the step status
   * @param status
   */
  setStatus (status) {
    logger.debug('TestResultRole.setStatus:', this.index, this.record._id, status);
    this.testRole.serverLink.setTestResultStepStatus(this.record._id, status)
  }
  
  /**
   * Save the step check results
   * @param checks
   */
  saveCheckResults (checks) {
    this.testRole.serverLink.saveTestResultStepChecks(this.record._id, checks)
  }
  
  /**
   * Save the step result
   * @param result
   */
  saveResult (result) {
    logger.debug('TestResultRole.saveResult:', this.index, this.record._id, result);
    this.testRole.serverLink.setTestResultStepResult(this.record._id, result)
  }
}

module.exports = TestRoleStep;
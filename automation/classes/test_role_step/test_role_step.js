"use strict";

let _                = require("underscore"),
    logger           = require('../log_assistant.js').getLogger(),
    RobaError        = require("../roba_error.js"),
    TestResultStatus = require('../enum/test_result_status.js'),
    TestResultCodes  = require('../enum/test_result_codes.js');

class TestRoleStep {
  /**
   * TestRoleStep
   * @param record TestResultStep record
   * @param index This step's index in the TestResultRole step list
   * @param testRole Parent TestRole object
   */
  constructor (record, index, testRole) {
    logger.debug('Creating TestRoleStep:', index, record._id);
    this.index       = index;
    this.record      = record;
    this.testRole    = testRole;
    this.dataContext = {};
    this.context     = testRole.context;
    this.serverLink  = testRole.serverLink;
  }
  
  /**
   * Initialize the step
   */
  init () {
    logger.debug('TestRoleStep.init:', this.index, this.record._id);
    let self = this;
    
    logger.debug('TestRoleStep.init step data:', self.record.data);
    
    // Combine all of the context data into a single glom
    _.defaults(self.dataContext, self.data, self.testRole.record.dataContext, self.record.dataContext);
    logger.debug('TestRoleStep.init step data context:', self.dataContext);
    
    // Set the status to queued
    self.setStatus(TestResultStatus.queued);
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('TestRoleStep.execute:', this.index, this.record._id);
    let self     = this,
        testRole = self.testRole,
        driver   = testRole.driver,
        pass;
    
    logger.debug("TestRoleStep.execute dataContext:", self.dataContext);
    
    // Set the status to running
    self.setStatus(TestResultStatus.executing);
    
    // Restore the context from a previous step
    self.context.update({ testResultStepId: self.record._id });
    self.context.milestone({ type: "step", data: self.record });
    logger.info("Executing TestRoleStep", self.index);
    driver.getClientLogs();
    
    // Do the actual step
    let error;
    try {
      pass = self.doStep();
      driver.getClientLogs();
    } catch (e) {
      error = new RobaError(e);
      logger.error('Error during test role step execution:', error);
      pass = false;
    }
    
    // Done
    self.setStatus(TestResultStatus.complete);
    if (pass) {
      self.setResult(TestResultCodes.pass);
    } else {
      self.setResult(TestResultCodes.fail, { error: error });
      self.testRole.setResult(TestResultCodes.fail, { error: error });
    }
    return pass;
  }
  
  /**
   * Perform the step-specific actions
   */
  doStep () {
    logger.error('TestRoleStep.doStep generic code being called, step class needs to override this method');
    return false;
  }
  
  /**
   * Skip this step
   */
  skip () {
    logger.debug('TestRoleStep.skip:', this.index, this.record._id);
    this.setStatus(TestResultStatus.skipped);
  }
  
  /**
   * Set the step status
   * @param status
   */
  setStatus (status) {
    logger.debug('TestRoleStep.setStatus:', this.index, this.record._id, status);
    this.serverLink.setTestResultStepStatus(this.record._id, status)
  }
  
  /**
   * Save the step result
   * @param resultCode
   * @param result
   */
  setResult (resultCode, result) {
    logger.debug('TestRoleStep.setResult:', this.index, this.record._id, resultCode, result);
    this.serverLink.setTestResultStepResult(this.record._id, resultCode, result)
  }
}

module.exports = TestRoleStep;
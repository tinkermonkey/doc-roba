"use strict";

let log4js            = require('log4js'),
    logger            = log4js.getLogger('test_result_role'),
    TestResultStatus  = require('../enum/test_result_status.js'),
    TestResultCodes   = require('../enum/test_result_codes.js');

class TestRoleStep {
  /**
   * TestRoleStep
   * @param record TestResultStep record
   * @param index This step's index in the TestResultRole step list
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
    
    logger.debug('TestRoleStep.init step data:', this.record.data);
    logger.debug('TestRoleStep.init step data context:', this.record.dataContext);
    
    // Set the status to queued
    self.setStatus(TestResultStatus.queued);
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('TestRoleStep.execute:', this.index, this.record._id);
    let self     = this,
        testRole = this.testRole,
        context  = testRole.context,
        driver   = testRole.driver,
        pass;
    
    // Set the status to running
    self.setStatus(TestResultStatus.executing);
    
    // Restore the context from a previous step
    context.update({ testRoleStepId: self.record._id });
    context.milestone({ type: "step", data: self.record });
    logger.info("Executing TestRoleStep", self.index);
    driver.getClientLogs();
  
    // Do the actual step
    try {
      pass = self.doStep();
      driver.getClientLogs();
    } catch (e) {
      logger.error('Error during test role step execution:', e);
      pass = false;
      self.setStatus(TestResultStatus.complete);
      self.setResult(TestResultCodes.fail, { error: e});
      self.testRole.setResult(TestResultCodes.fail, { error: e });
    }
    
    // Done
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
    this.testRole.serverLink.setTestResultStepStatus(this.record._id, status)
  }
  
  /**
   * Save the step result
   * @param resultCode
   * @param result
   */
  setResult (resultCode, result) {
    logger.debug('TestRoleStep.setResult:', this.index, this.record._id, resultCode, result);
    this.testRole.serverLink.setTestResultStepResult(this.record._id, resultCode, result)
  }
}

module.exports = TestRoleStep;
"use strict";

let logger       = require('../log_assistant.js').getLogger(),
    TestRoleStep = require('./test_role_step.js');

class TestRoleStepWait extends TestRoleStep {
  /**
   * Initialize the step
   */
  init () {
    logger.debug('TestRoleStepWait.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent initializer
    super.init();
    
    // Load a live record of the step in order to sense status changes
    self.waitRecord = self.serverLink.liveRecord('test_result_step_wait', [
      self.record.projectId, self.record.testResultId, self.record.data.waitId
    ], 'test_result_step_waits', { testResultId: self.record.testResultId, waitId: self.record.data.waitId });
    logger.debug('TestRoleStepWait.init loaded wait record:', self.waitRecord);
    if (!self.waitRecord) {
      throw new Error('TestRoleStepWait.init failed to load wait record');
    }
  }
  
  /**
   * Wait for everyone on the wait list to arrive
   */
  doStep () {
    logger.debug('TestRoleStepWait.doStep:', this.index, this.record._id);
    let self      = this,
        driver    = self.testRole.driver,
        startTime = Date.now(),
        timedOut  = false,
        timeout   = 30000;
    
    // First check this role in for anyone else waiting
    logger.debug('TestRoleStepWait.doStep checking in for wait:', self.record.testResultId, self.record.data.waitId);
    self.serverLink.checkInForWaitStep(self.record.testResultId, self.record.data.waitId, self.record.testResultRoleId);
    
    logger.debug('TestRoleStepWait.doStep waiting:', Date.now() - startTime, timedOut, self.waitRecord.everyoneArrived);
    while (!timedOut && !self.waitRecord.everyoneArrived) {
      logger.debug('TestRoleStepWait.doStep waiting:', Date.now() - startTime, timedOut, self.waitRecord.everyoneArrived);
      driver.wait(1000);
      timedOut = Date.now() - startTime > timeout;
    }
    logger.debug('TestRoleStepWait.doStep waiting over:', Date.now() - startTime, timedOut, self.waitRecord.everyoneArrived);
    
    if(timedOut){
      throw new Error('Wait step timed out');
    }
  }
}

module.exports = TestRoleStepWait;
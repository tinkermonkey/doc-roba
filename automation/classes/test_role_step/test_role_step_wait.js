"use strict";

let logger       = require('../log_assistant.js').getLogger(),
    TestRoleStep = require('./test_role_step.js');

class TestRoleStepWait extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepWait.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent constructor
    super.init();
    
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('TestRoleStepWait.execute:', this.index, this.record._id);
    let self = this;
    
    // Call the parent method
    super.execute();
    
  }
}

module.exports = TestRoleStepWait;
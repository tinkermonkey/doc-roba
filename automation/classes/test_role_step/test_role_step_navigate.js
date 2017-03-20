"use strict";

let Action       = require('../action/action.js'),
    Node         = require('../node/node.js'),
    log4js       = require('log4js'),
    logger       = log4js.getLogger('test_result_role'),
    TestRoleStep = require('./test_role_step.js');

class TestRoleStepNavigate extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepNavigate.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent constructor
    super.init();
    
  }
  
  /**
   * Execute this step
   */
  execute () {
    logger.debug('TestRoleStepNavigate.execute:', this.index, this.record._id);
    let self = this;
    
    // Call the parent method
    super.execute();
    
  }
}

module.exports = TestRoleStepNavigate;
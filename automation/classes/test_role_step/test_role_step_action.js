"use strict";

let Action       = require('../action/action.js'),
    Node         = require('../node/node.js'),
    log4js       = require('log4js'),
    logger       = log4js.getLogger('test_result_role'),
    TestRoleStep = require('./test_role_step.js');

class TestRoleStepAction extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepAction.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent constructor
    super.init();
    
    // Load the node for this step
    self.node = new Node(self.record.data.nodeId, self.record.projectId, self.record.projectVersionId, self.testRole.serverLink);
    self.node.init();
    
    // Load the action for this step if there is one
    self.action = new Action(self.record.data.actionId, self.record.projectId, self.record.projectVersionId, self.testRole.serverLink);
    self.action.init();
  }
  
  /**
   * Execute an action and validate the destination node
   */
  doStep () {
    logger.debug('TestRoleStepAction.doStep:', this.index, this.record._id);
    let self   = this,
        driver = self.testRole.driver,
        result = {
          ready: false,
          valid: false
        };
    
    // Take the action
    logger.debug("TestRoleStepAction.doStep taking action");
    self.action.addVariable('account', self.testRole.account);
    self.action.execute(driver, self.record.dataContext);
  
    // Inject the helpers
    driver.wait(1000);
    driver.injectHelpers();
  
    // Wait for the node to be ready
    logger.debug("TestRoleStepAction.doStep waiting for node to be ready");
    self.node.addVariable('account', self.testRole.account);
    result.ready = self.node.checkReady(driver, self.record.dataContext);
    driver.getClientLogs();
  
    // Check that the node is valid
    if(result.ready){
      logger.debug("TestRoleStepAction.doStep validating node");
      result.valid = self.node.validate(driver, self.record.dataContext);
      driver.getClientLogs();
    }
  
    logger.debug("TestRoleStepAction.doStep complete:", result);
    return result.ready && result.valid
  }
}

module.exports = TestRoleStepAction;
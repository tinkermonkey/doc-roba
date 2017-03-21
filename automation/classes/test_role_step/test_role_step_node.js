"use strict";

let Action       = require('../action/action.js'),
    Node         = require('../node/node.js'),
    log4js       = require('log4js'),
    logger       = log4js.getLogger('test_result_role'),
    TestRoleStep = require('./test_role_step.js');

class TestRoleStepNode extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepNode.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent constructor
    super.init();
    
    // Load the node for this step
    self.node = new Node(self.record.data.nodeId, self.record.projectId, self.record.projectVersionId, self.testRole.serverLink);
    self.node.init();
  }
  
  /**
   * Validate the node
   */
  doStep () {
    logger.debug('TestRoleStepNode.doStep:', this.index, this.record._id);
    let self   = this,
        driver = self.testRole.driver,
        result = {
          ready: false,
          valid: false
        };
    
    // If this is the first step then we need to bootstrap the browser to the url
    if (self.index == 0) {
      logger.debug("Step 0, navigating to starting point:", {
        serverUrl: self.testRole.testServer && self.testRole.testServer.url,
        nodeUrl  : self.node.record && self.node.record.url
      });
      driver.url(driver.buildUrl(self.testRole.testServer.url, self.node.record.url));
      driver.wait(1000);
    }
    
    // Inject the helpers
    driver.injectHelpers();
    
    // Wait for the node to be ready
    logger.debug("TestRoleStepNode.doStep waiting for node to be ready");
    self.node.addVariable('account', self.testRole.account);
    result.ready = self.node.checkReady(driver, self.testRole.dataContext);
    driver.getClientLogs();
    
    // Check that the node is valid
    if(result.ready){
      logger.debug("TestRoleStepNode.doStep validating node");
      result.valid = self.node.validate(driver, self.testRole.dataContext);
      driver.getClientLogs();
    }
    
    logger.debug("TestRoleStepNode.doStep complete:", result);
    return result.ready && result.valid
  }
}

module.exports = TestRoleStepNode;
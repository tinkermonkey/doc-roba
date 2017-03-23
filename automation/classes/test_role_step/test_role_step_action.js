"use strict";

let _              = require('underscore'),
    Action         = require('../action/action.js'),
    Node           = require('../node/node.js'),
    logger         = require('../log_assistant.js').getLogger(),
    TestRoleStep   = require('./test_role_step.js'),
    ScreenshotKeys = require('../enum/screenshot_keys.js');

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
    
    // Set the context
    self.context.update({ actionId: self.action.record.staticId });
    self.context.milestone({ type: "action", data: { action: self.action.record, context: self.dataContext } });
    
    // Take the action
    logger.debug("TestRoleStepAction.doStep taking action");
    _.keys(self.dataContext).forEach((key) => {
      self.action.addVariable(key, self.dataContext[ key ]);
    });
    self.action.execute(driver, self.dataContext);
    self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterAction);
    
    // Inject the helpers
    driver.wait(1000);
    driver.injectHelpers();
    
    // Wait for the node to be ready
    logger.debug("TestRoleStepAction.doStep waiting for node to be ready");
    _.keys(self.dataContext).forEach((key) => {
      self.node.addVariable(key, self.dataContext[ key ]);
    });
    result.ready = self.node.checkReady(driver, self.dataContext);
    driver.getClientLogs();
    
    // Screenshot of the page ready
    if (result.ready.pass) {
      self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
    } else {
      self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.error);
    }
    
    // Check that the node is valid
    if (result.ready.pass) {
      logger.debug("TestRoleStepAction.doStep validating node");
      result.valid = self.node.validate(driver, self.dataContext);
      driver.getClientLogs();
    }
  
    // Store the ready checks
    self.serverLink.saveTestResultStepChecks(self.record._id, [{
      node: self.node.record,
      ready: result.ready.checks,
      validation: result.valid.checks
    }]);
  
    logger.debug("TestRoleStepAction.doStep complete:", result.ready.pass === true && result.valid.pass === true, result);
    self.context.update({ pass: result.ready.pass === true && result.valid.pass === true });
    return result.ready.pass === true && result.valid.pass === true
  }
}

module.exports = TestRoleStepAction;
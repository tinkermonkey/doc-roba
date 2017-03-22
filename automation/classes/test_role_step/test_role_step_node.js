"use strict";

let _              = require('underscore'),
    Node           = require('../node/node.js'),
    logger         = require('../log_assistant.js').getLogger(),
    TestRoleStep   = require('./test_role_step.js'),
    ScreenshotKeys = require('../enum/screenshot_keys.js');

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
    
    // Update the context
    self.context.update({ nodeId: self.record.data.node.staticId });
    self.context.milestone({ type: "node", data: self.record.data.node });
    
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
    
    // save a screenshot of the page
    self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.loading);
    
    // Wait for the node to be ready
    logger.debug("TestRoleStepNode.doStep waiting for node to be ready", self.dataContext);
    _.keys(self.dataContext).forEach((key) => {
      self.node.addVariable(key, self.dataContext[ key ]);
    });
    result.ready = self.node.checkReady(driver, self.dataContext);
    driver.getClientLogs();
    
    // Screenshot of the page ready
    if (result.ready) {
      self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
    } else {
      self.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.error);
    }
    
    // Check that the node is valid
    if (result.ready) {
      logger.debug("TestRoleStepNode.doStep validating node");
      result.valid = self.node.validate(driver, self.dataContext);
      driver.getClientLogs();
    }
    
    logger.debug("TestRoleStepNode.doStep complete:", result);
    self.context.update({ pass: result.isReady && result.isValid });
    return result.ready && result.valid
  }
}

module.exports = TestRoleStepNode;
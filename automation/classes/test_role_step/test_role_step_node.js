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
        result, pass;
    
    // Validate the node
    result = TestRoleStepNode.doNodeStep(self, self.node);
    
    // Store the ready checks
    self.serverLink.saveTestResultStepChecks(self.record._id, [{
      node: self.node.record,
      ready: result.ready.checks,
      validation: result.valid.checks
    }]);
  
    pass = result.ready.pass === true && result.valid.pass === true;
    logger.debug("TestRoleStepAction.doStep complete: ready=", result.ready.pass === true, 'valid=', result.valid.pass === true, 'result=', result);
    self.context.update({ pass: pass });
  
    if(!pass){
      if(result.ready.error){
        throw result.ready.error
      } else if(result.valid.error){
        throw result.valid.error
      } else {
        throw new Error('Action failed to reach destination');
      }
    }
  }
  
  /**
   * Static method so that logic can be shared with navigate steps
   * @param {TestRoleStep} step
   * @param {Node} node The node object
   */
  static doNodeStep(step, node){
    logger.debug('TestRoleStepNode.doNodeStep:', step.index, node.record._id);
    let driver = step.testRole.driver,
        result = {
          ready: {},
          valid: {}
        };
  
    // Update the context
    step.context.update({ nodeId: node.record.staticId });
    step.context.milestone({ type: "node", data: node.record });
  
    // If this is the first step then we need to bootstrap the browser to the url
    if (step.index === 0 && !step.navigated) {
      logger.debug("Step 0, navigating to starting point:", {
        serverUrl: step.testRole.testServer && step.testRole.testServer.url,
        nodeUrl  : node.record.url
      });
      driver.url(driver.buildUrl(step.testRole.testServer.url, node.record.url));
      step.navigated = true;
    }
  
    // save a screenshot of the page
    step.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.loading);
  
    // Wait for the node to be ready
    logger.debug("TestRoleStepNode.doStep waiting for node to be ready", step.dataContext);
    _.keys(step.dataContext).forEach((key) => {
      node.addVariable(key, step.dataContext[ key ]);
    });
    result.ready = node.checkReady(driver, step.dataContext);
    driver.getClientLogs();
  
    // Screenshot of the page ready
    if (result.ready.pass) {
      step.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
    } else {
      step.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.error);
    }
  
    // Check that the node is valid
    if (result.ready.pass) {
      logger.debug("TestRoleStepNode.doStep validating node");
      result.valid = node.validate(driver, step.dataContext);
      driver.getClientLogs();
    }
  
    return result;
  }
}

module.exports = TestRoleStepNode;
"use strict";

let _                = require('underscore'),
    Action           = require('../action/action.js'),
    Node             = require('../node/node.js'),
    logger           = require('../log_assistant.js').getLogger(),
    TestRoleStep     = require('./test_role_step.js'),
    TestRoleStepNode = require('./test_role_step_node.js'),
    ScreenshotKeys   = require('../enum/screenshot_keys.js');

class TestRoleStepAction extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepAction.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent initializer
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
    let self = this,
        result, pass;
    
    // Do the work
    result = TestRoleStepAction.doActionStep(self, self.action, self.node);
    
    // Store the ready checks
    self.serverLink.saveTestResultStepChecks(self.record._id, [ {
      node      : self.node.record,
      ready     : result.ready.checks,
      validation: result.valid.checks
    } ]);
    
    pass = result.ready.pass === true && result.valid.pass === true;
    logger.debug("TestRoleStepAction.doStep complete: ready=", result.ready.pass === true, 'valid=', result.valid.pass === true, 'result=', result);
    self.context.update({ pass: pass });
  
    if(!pass){
      throw new Error('Action failed to reach destination');
    }
  }
  
  /**
   * Static method so that logic can be shared with navigate steps
   * @param {TestRoleStep} step
   * @param {Action} action The action object
   * @param {Node} node The destination node object
   * @param {boolean} skipNodeValidation Whether the node validation should be skipped (for navigation steps)
   */
  static doActionStep (step, action, node, skipNodeValidation) {
    logger.debug('TestRoleStepAction.doActionStep:', step.index, action.record._id, node.record._id);
    let driver = step.testRole.driver,
        result;
    
    // Set the context
    step.context.update({ actionId: action.record.staticId });
    step.context.milestone({ type: "action", data: { action: action.record, context: step.dataContext } });
    
    // Take the action
    logger.debug("TestRoleStepAction.doActionStep taking action");
    _.keys(step.dataContext).forEach((key) => {
      action.addVariable(key, step.dataContext[ key ]);
    });
    action.execute(driver, step.dataContext);
    driver.getClientLogs();
    step.serverLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterAction);
    
    // Wait a little bit
    driver.wait(2000);
    
    // Validate the destination node
    if(!skipNodeValidation){
      result = TestRoleStepNode.doNodeStep(step, node);
    }
    
    return result;
  }
}

module.exports = TestRoleStepAction;
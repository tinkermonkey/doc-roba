"use strict";

let Action             = require('../action/action.js'),
    Node               = require('../node/node.js'),
    logger             = require('../log_assistant.js').getLogger(),
    TestRoleStep       = require('./test_role_step.js'),
    TestRoleStepNode   = require('./test_role_step_node.js'),
    TestRoleStepAction = require('./test_role_step_action.js');

class TestRoleStepNavigate extends TestRoleStep {
  /**
   * Initialize the test step
   */
  init () {
    logger.debug('TestRoleStepNavigate.init:', this.index, this.record._id);
    let self = this;
    
    // Call the parent initializer
    super.init();
    
    // Load the route for this step
    self.route = self.serverLink.call("loadNavigationRoute", [ self.record.data.destinationId, self.record.data.sourceId, self.record.projectVersionId ]);
    logger.debug('Route loaded:', self.route);
    
    // Initialize the route steps
    self.routeData = [];
    self.route.steps.forEach((routeStep) => {
      let stepData = {
        node: new Node(routeStep.node.staticId, self.record.projectId, self.record.projectVersionId, self.serverLink).init()
      };
      if (routeStep.action) {
        stepData.action = new Action(routeStep.action.staticId, self.record.projectId, self.record.projectVersionId, self.serverLink).init();
      }
      self.routeData.push(stepData);
    });
  }
  
  /**
   * Navigate the route
   */
  doStep () {
    logger.debug('TestRoleStepNavigate.doStep:', this.index, this.record._id);
    let self = this,
        pass = true;
    
    // Update the context
    self.context.milestone({ type: "route", data: self.route });
    
    // All of the checks will be stored in an array so they can be persisted at the end
    self.checks = [];
    
    // Execute each of the route steps
    self.route.steps.forEach((routeStep, i) => {
      if (pass && !self.testRole.testResult.abort && !self.testRole.driverEnded) {
        let stepData = self.routeData[ i ];
        pass         = self.doRouteStep(routeStep, stepData, i);
      }
    });
    
    // Save the validation checks
    logger.debug('TestRoleStepNavigate.doStep complete, saving checks:', self.checks);
    self.serverLink.saveTestResultStepChecks(self.record._id, self.checks);
    
    // Explain the failure if there was one
    if(!pass){
      throw new Error('Navigation failed to reach destination');
    }
  }
  
  /**
   * Execute a step on the route
   * @param routeStep
   * @param stepData
   * @param stepIndex
   */
  doRouteStep (routeStep, stepData, stepIndex) {
    logger.debug('TestRoleStepNavigate.doRouteStep:', stepIndex, routeStep);
    let self   = this,
        isLast = stepIndex === self.route.steps.length - 1,
        result, pass;
    
    // First step needs to be navigated manually if this is the first test step
    if (stepIndex === 0 && self.index === 0) {
      result = TestRoleStepNode.doNodeStep(self, stepData.node);
    } else {
      result = TestRoleStepAction.doActionStep(self, stepData.action, stepData.node, isLast);
    }
    
    // Store the checks for this step
    if(!isLast){
      pass = result.ready.pass === true && result.valid.pass === true;
      self.checks.push({
        order     : stepIndex,
        pass      : pass,
        node      : stepData.node.record,
        ready     : result.ready.checks,
        validation: result.valid.checks
      });
  
      logger.debug("TestRoleStepNavigate.doRouteStep complete:", result.ready.pass === true, result.valid.pass === true, result);
      self.context.update({ pass: pass });
      return pass
    } else {
      // The last step of the navigation will always be followed by a node step which will do the validation
      return true
    }
  }
}

module.exports = TestRoleStepNavigate;
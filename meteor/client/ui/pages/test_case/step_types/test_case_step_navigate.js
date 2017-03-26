import './test_case_step_navigate.html';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../../imports/api/nodes/nodes.js';
import { TestCaseSteps } from '../../../../../imports/api/test_cases/test_case_steps.js';
import { TestCaseStepTypes } from '../../../../../imports/api/test_cases/test_case_step_types.js';
import { RobaRouter } from '../../../../../imports/api/roba_router/roba_router.js';
import '../../../components/svg_snippets/vertical_route_snippet.js';

let debug = true;

/**
 * Template Helpers
 */
Template.TestCaseStepNavigate.helpers({
  source() {
    return Template.instance().nodeId.get()
  },
  destination() {
    return Template.instance().destinationNode.get()
  },
  complete() {
    let instance = Template.instance();
    return instance.nodeId.get() && instance.destinationNode.get()
  },
  route() {
    return Template.instance().route.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepNavigate.events({});

/**
 * Template Created
 */
Template.TestCaseStepNavigate.created = function () {
  let instance             = Template.instance();
  instance.nodeId          = new ReactiveVar();
  instance.destinationNode = new ReactiveVar();
  instance.route           = new ReactiveVar();
  instance.lastSave        = 0;
  
  instance.autorun(function () {
    let data            = Template.currentData(),
        sourceStep      = TestCaseSteps.findOne({
          testCaseRoleId: data.testCaseRoleId,
          order         : { $lt: data.order },
          type          : { $in: [ TestCaseStepTypes.node, TestCaseStepTypes.action ] }
        }, { sort: { order: -1 } }),
        destinationStep = TestCaseSteps.findOne({
          testCaseRoleId: data.testCaseRoleId,
          order         : { $gt: data.order }
        }, { sort: { order: 1 } }),
        sourceNodeId, destinationNodeId, testRoute;
    console.log('TestCaseStepNavigate computing route:', data);
    
    // clear the error
    data.error.set();
    
    // Figure out the destination first because this is required
    if (destinationStep && destinationStep.data && destinationStep.data.nodeId) {
      destinationNodeId = destinationStep.data.nodeId;
      instance.destinationNode.set(destinationNodeId);
    } else {
      instance.destinationNode.set();
      data.error.set("This step requires a node to navigate to");
    }
    
    // If the source isn't known, try to infer it
    if (sourceStep && sourceStep.data && sourceStep.data.nodeId) {
      instance.nodeId.set(sourceStep.data.nodeId);
      sourceNodeId = sourceStep.data.nodeId
    } else if (destinationNodeId) {
      // Try to identify a starting point
      try {
        testRoute = RobaRouter.routeFromStart(destinationNodeId);
        if (testRoute.feasible && testRoute.steps[ 0 ] && testRoute.steps[ 0 ].node) {
          //sourceNodeId = testRoute.steps[ 0 ].node.staticId;
          instance.nodeId.set(sourceNodeId);
        } else {
          instance.nodeId.set();
          data.error.set("Could not auto-route to the destination, please add a node step before this one");
        }
      } catch (e) {
        instance.nodeId.set();
        console.error('TestCaseStepNavigate error computing test route:', e);
        data.error.set("This step requires a node from which to navigate");
      }
    } else {
      
    }
    
    // Create the route
    if ((sourceNodeId && destinationNodeId) || (testRoute && testRoute.feasible && destinationNodeId)) {
      // save the data if it changed
      let save = true;
      if (data.data && data.data.destinationId) {
        save = !(data.data.sourceId == sourceNodeId && data.data.destinationId == destinationNodeId);
        debug && console.log("TestCaseStepNavigate data points:", data.data.sourceId, sourceNodeId, data.data.destinationId, destinationNodeId, data.data.sourceId == sourceNodeId && data.data.destinationId == destinationNodeId);
      }
      
      if (save) {
        let stepData = {
          sourceId     : sourceNodeId,
          destinationId: destinationNodeId
        };
        
        console.log("TestCaseStepNavigate saving step data:", stepData, data.data);
        if (stepData && Date.now() - instance.lastSave > 5000) {
          instance.lastSave = Date.now();
          TestCaseSteps.update(data._id, { $set: { data: stepData } }, function (error) {
            if (error) {
              RobaDialog.error("Failed to update navigation step: " + error.message);
            }
          });
        }
      }
      
      if (testRoute) {
        console.log("TestCaseStepNavigate using test route:", testRoute);
        instance.route.set(testRoute);
      } else {
        console.log("TestCaseStepNavigate creating new route:", sourceNodeId, destinationNodeId);
        let sourceNodeRecord      = Nodes.findOne({ projectVersionId: data.projectVersionId, staticId: sourceNodeId }),
            destinationNodeRecord = Nodes.findOne({ projectVersionId: data.projectVersionId, staticId: destinationNodeId });
        if (sourceNodeRecord && destinationNodeRecord) {
          // ready to create the route
          try {
            let route = RobaRouter.nodeToNode(sourceNodeRecord, destinationNodeRecord);
            instance.route.set(route);
          } catch (e) {
            console.error("RobaRouter error:", e);
            data.error.set("There was no route found for this step");
          }
        } else {
          instance.route.set();
          data.error.set("One of the nodes for this step could not be found");
        }
      }
      
    } else {
      instance.route.set();
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseStepNavigate.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepNavigate.destroyed = function () {
  
};

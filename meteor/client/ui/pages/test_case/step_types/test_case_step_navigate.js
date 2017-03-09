import './test_case_step_navigate.html';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../../imports/api/nodes/nodes.js';
import { TestCaseSteps } from '../../../../../imports/api/test_cases/test_case_step.js';
import { TestCaseStepTypes } from '../../../../../imports/api/test_cases/test_case_step_types.js';
import { RobaRouter } from '../../../../../imports/api/roba_router/roba_router.js';
import '../../../components/routes/route_map.js';

var debug = true;

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
    var instance = Template.instance();
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
  
  instance.autorun(function () {
    var data            = Template.currentData(),
        sourceStep      = TestCaseSteps.findOne({
          testCaseRoleId: data.testCaseRoleId,
          order         : { $lt: data.order },
          type          : { $in: [ TestCaseStepTypes.node, TestCaseStepTypes.action ] }
        }, { sort: { order: -1 } }),
        destinationStep = TestCaseSteps.findOne({
          testCaseRoleId: data.testCaseRoleId,
          order         : { $gt: data.order }
        }, { sort: { order: 1 } }),
        sourceNode, destinationNode;
    console.log('TestCaseStepNavigate computing route:', data);
    
    // clear the error
    data.error.set();
    
    // Figure out the destination first because this is required
    if (destinationStep && destinationStep.data && destinationStep.data.nodeId) {
      destinationNode = destinationStep.data.nodeId;
      instance.destinationNode.set(destinationNode);
    } else {
      instance.destinationNode.set();
      data.error.set("This step requires a node to navigate to");
    }
    
    // If the source isn't known, try to infer it
    if (sourceStep && sourceStep.data && sourceStep.data.nodeId) {
      instance.nodeId.set(sourceStep.data.nodeId);
      sourceNode = sourceStep.data.nodeId
    } else if (destinationNode) {
      // Try to identify a starting point
      try {
        var testRoute = RobaRouter.routeFromStart(destinationNode);
        if (testRoute.feasible && testRoute.route[ 0 ] && testRoute.route[ 0 ].node) {
          sourceNode = testRoute.route[ 0 ].node.staticId
          instance.nodeId.set(sourceNode);
        } else {
          instance.nodeId.set();
          data.error.set("Could not auto-route to the destination, please add a node step before this one");
        }
      } catch (e) {
        instance.nodeId.set();
        data.error.set("This step requires a node from which to navigate");
      }
    } else {
      
    }
    
    // Create the route
    if (sourceNode && destinationNode) {
      // save the data if it changed
      var save = true;
      if (data.data && data.data.sourceId && data.data.destinationId) {
        save = !(data.data.sourceId == sourceNode && data.data.destinationId == destinationNode);
        debug && console.log("TestCaseStepNavigate data points: ", data.data.sourceId, sourceNode, data.data.destinationId, destinationNode, data.data.sourceId == sourceNode && data.data.destinationId == destinationNode);
      }
      
      if (save) {
        var stepData           = data.data || {};
        stepData.sourceId      = sourceNode;
        stepData.destinationId = destinationNode;
  
        console.log("TestCaseStepNavigate saving step data: ", stepData, data.data);
        TestCaseSteps.update(data._id, { $set: { data: stepData } }, function (error) {
          if (error) {
            RobaDialog.error("Failed to update navigation step: " + error.message);
          }
        });
      }
      
      var sourceNodeRecord      = Nodes.findOne({ projectVersionId: data.projectVersionId, staticId: sourceNode }),
          destinationNodeRecord = Nodes.findOne({ projectVersionId: data.projectVersionId, staticId: destinationNode });
      if (sourceNodeRecord && destinationNodeRecord) {
        // ready to create the route
        try {
          var route = RobaRouter.nodeToNode(sourceNodeRecord, destinationNodeRecord);
          instance.route.set(route);
        } catch (e) {
          console.error("RobaRouter error:", e);
          data.error.set("There was no route found for this step");
        }
      } else {
        instance.route.set();
        data.error.set("One of the nodes for this step could not be found");
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

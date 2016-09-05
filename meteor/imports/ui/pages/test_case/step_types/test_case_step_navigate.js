import './test_case_step_navigate.html';

import {Template} from 'meteor/templating';

import {Nodes} from '../../../../api/node/node.js';
import {TestCaseSteps} from '../../../../api/test_case/test_case_step.js';
import {TestCaseStepTypes} from '../../../../api/test_case/test_case_step_types.js';

import {RobaRouter} from '../../../../api/roba_router/roba_router.js';
import '../../../components/routes/route_map.js';

/**
 * Template Helpers
 */
Template.TestCaseStepNavigate.helpers({
  source: function () {
    return Template.instance().nodeId.get()
  },
  destination: function () {
    return Template.instance().destinationNode.get()
  },
  complete: function () {
    var instance = Template.instance();
    return instance.nodeId.get() && instance.destinationNode.get()
  },
  route: function () {
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
  var instance = this;
  instance.nodeId = new ReactiveVar();
  instance.destinationNode = new ReactiveVar();
  instance.route = new ReactiveVar();

  instance.autorun(function () {
    var data = Template.currentData(),
      sourceStep = TestCaseSteps.findOne({
        testCaseRoleId: data.testCaseRoleId,
        order: {$lt: data.order},
        type: {$in: [TestCaseStepTypes.node, TestCaseStepTypes.action]}
      }, {sort: {order: -1}}),
      destinationStep = TestCaseSteps.findOne({
        testCaseRoleId: data.testCaseRoleId,
        order: {$gt: data.order}
      }, {sort: {order: 1}}),
      sourceNode, destinationNode;
    
    // clear the error
    data.error.set();

    if(sourceStep && sourceStep.data && sourceStep.data.nodeId){
      instance.nodeId.set(sourceStep.data.nodeId);
      sourceNode = sourceStep.data.nodeId
    } else {
      instance.nodeId.set();
      data.error.set("This step requires a node from which to navigate");
    }

    if(destinationStep && destinationStep.data && destinationStep.data.nodeId){
      instance.destinationNode.set(destinationStep.data.nodeId);
      destinationNode = destinationStep.data.nodeId
    } else {
      instance.destinationNode.set();
      data.error.set("This step requires a node to navigate to");
    }
  
    // create the route
    if(sourceNode && destinationNode){
      // save the data if it changed
      var save = true;
      if(data.data && data.data.sourceId && data.data.destinationId){
        save = !(data.data.sourceId == sourceNode && data.data.destinationId == destinationNode);
      }

      if(save){
        var stepData = data.data || {};
        stepData.sourceId = sourceNode;
        stepData.destinationId = destinationNode;
        console.log("Saving navigation step data: ", stepData, data.data);
        TestCaseSteps.update(data._id, {$set: {data: stepData}}, function (error) {
          if(error){
            RobaDialog.error("Failed to update navigation step: " + error.message);
          }
        });
      }

      var sourceNodeRecord = Nodes.findOne({projectVersionId: data.projectVersionId, staticId: sourceNode}),
        destinationNodeRecord = Nodes.findOne({projectVersionId: data.projectVersionId, staticId: destinationNode});
      if(sourceNodeRecord && destinationNodeRecord){
        // ready to create the route
        try{
          var route = RobaRouter.nodeToNode(sourceNodeRecord, destinationNodeRecord);
          instance.route.set(route);
        } catch(e){
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

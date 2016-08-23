import './test_case_step_node.html';

import {Template} from 'meteor/templating';

import '../../../components/editable_fields/node_selector/editable_node_selector.js';

/**
 * Template Helpers
 */
Template.TestCaseStepNode.helpers({
  getNodeId: function () {
    if(this.data){
      return this.data.nodeId
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepNode.events({
});

/**
 * Template Created
 */
Template.TestCaseStepNode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseStepNode.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepNode.destroyed = function () {
  
};

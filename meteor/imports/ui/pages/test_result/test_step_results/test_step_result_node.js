import './test_step_result_node.html';
import { Template } from 'meteor/templating';
import { LogMessages } from '../../../../api/log_message/log_message.js';
import '../common_panels/test_step_result_node_milestone.js';

/**
 * Template Helpers
 */
Template.TestResultStepNode.helpers({
  // TODO: this is a convoluted way to obtain the context
  nodeContext: function () {
    var logContext = LogMessages.findOne({
      "context.testResultStepId": this.step._id,
      sender                    : "context",
      "data.type"               : "node"
    });
    if (logContext && logContext.data.length) {
      return logContext.data[ 0 ].data
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepNode.events({});

/**
 * Template Created
 */
Template.TestResultStepNode.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TestResultStepNode.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestResultStepNode.onDestroyed(() => {
  
});

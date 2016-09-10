import './test_result_step_map.html';
import { Template } from 'meteor/templating';
import { DocTreeConfig } from '../../lib/doc_tree/doc_tree_config.js';
import '../../components/svg_snippets/action_snippet.js';
import '../../components/svg_snippets/node_snippet.js';

/**
 * Template Helpers
 */
Template.TestResultStepMap.helpers({
  height  : function () {
    var height = DocTreeConfig.nodes.height;
    if (this.data && this.type && this.type == "action") {
      height = DocTreeConfig.nodes.yMargin;
    }
    return height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  xMargin : function () {
    return DocTreeConfig.standalone.margin * 2
  },
  yMargin : function () {
    return DocTreeConfig.standalone.margin
  },
  isAction: function () {
    return this.type == "action"
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepMap.events({});

/**
 * Template Created
 */
Template.TestResultStepMap.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.TestResultStepMap.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.TestResultStepMap.onDestroyed(() => {
  
});

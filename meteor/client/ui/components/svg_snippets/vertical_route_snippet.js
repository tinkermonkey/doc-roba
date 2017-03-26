import './vertical_route_snippet.html';
import { Template } from 'meteor/templating';
import { Actions } from '../../../../imports/api/actions/actions.js';
import { Nodes } from '../../../../imports/api/nodes/nodes.js';
import { DocTreeConfig } from '../../lib/doc_tree/doc_tree_config.js';
import { Util } from '../../../../imports/api/util.js';
import './action_snippet.js';
import './node_snippet.js';

/**
 * Template Helpers
 */
Template.VerticalRouteSnippet.helpers({
  width() {
    return DocTreeConfig.nodes.width * 2 * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  height(steps) {
    let height = 0;
    if (steps) {
      // calculate the starting Y value for each step
      steps.forEach((step, i) => {
        height += step.node ? DocTreeConfig.nodes.height : 0;
        height += step.action ? DocTreeConfig.nodes.yMargin : 0;
      });
      height += (steps.length - 1) * DocTreeConfig.nodes.borderWidth;
    }
    return height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  nodeY() {
    return this.action ? DocTreeConfig.nodes.yMargin + DocTreeConfig.nodes.borderWidth : 0
  },
  xMargin() {
    let width = DocTreeConfig.nodes.width * 2 * (this.scale || 1) + DocTreeConfig.standalone.margin * 2;
    return (width - DocTreeConfig.nodes.width) / 2
  },
  yMargin() {
    return DocTreeConfig.standalone.margin
  },
  getScale() {
    return this.scale || 1
  },
  getSteps() {
    let steps  = this.steps,
        projectVersionId = Util.findParentData('projectVersionId'),
        startY = 0;
    
    if (steps) {
      // Calculate the starting Y value for each step
      steps.forEach((step, i) => {
        // get the node if it's needed
        if(step.nodeId && !step.node){
          step.node = Nodes.findOne({
            $or: [
              { staticId: step.nodeId, projectVersionId: projectVersionId },
              { _id: step.nodeId }
            ]
          });
        }
  
        // get the action if it's needed
        if(step.actionId && !step.action){
          step.action = Actions.findOne({
            $or: [
              { staticId: step.actionId, projectVersionId: projectVersionId },
              { _id: step.actionId }
            ]
          });
        }
        
        // Set the starting point
        step.startY = startY;
        
        // Add the height so the next step starts in the right place
        startY += DocTreeConfig.nodes.borderWidth;
        startY += step.node ? DocTreeConfig.nodes.height : 0;
        startY += step.action ? DocTreeConfig.nodes.yMargin + DocTreeConfig.nodes.borderWidth : 0;
      });
      steps = this.steps;
    } else if (this.node && this.action) {
      steps = [ {
        node    : this.node,
        action  : this.action,
        startY  : 0
      } ];
    }
    
    if (this.hideDestination && steps && steps.length) {
      console.log('VerticalRouteSnippet hiding last node:', this);
      delete steps[ steps.length - 1 ].node;
    }
    
    return steps
  }
});

/**
 * Template Helpers
 */
Template.VerticalRouteSnippet.events({});

/**
 * Template Created
 */
Template.VerticalRouteSnippet.created = function () {
};

/**
 * Template Rendered
 */
Template.VerticalRouteSnippet.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.VerticalRouteSnippet.destroyed = function () {
  
};

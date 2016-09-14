import './adventure_selector_result.html';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../../imports/api/node/node.js';
import './adventure_selector_action_menu.js';

/**
 * Template Helpers
 */
Template.AdventureSelectorResult.helpers({
  currentNode(){
    let context = Template.parentData(1);
    if(context.currentNodeId && context.adventure){
      return Nodes.findOne({staticId: context.currentNodeId, projectVersionId: context.adventure.projectVersionId});
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureSelectorResult.events({});

/**
 * Template Created
 */
Template.AdventureSelectorResult.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureSelectorResult.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureSelectorResult.onDestroyed(() => {
  
});

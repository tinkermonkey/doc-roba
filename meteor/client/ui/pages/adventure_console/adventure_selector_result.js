import './adventure_selector_result.html';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../imports/api/node/node.js';
import './adventure_selector_action_menu.js';

/**
 * Template Helpers
 */
Template.AdventureSelectorResult.helpers({
  fullContext () {
    var instance      = Template.instance(),
        selector      = this,
        currentNodeId = instance.data.currentNodeId,
        adventure     = instance.data.adventure;
    
    if (currentNodeId && adventure) {
      return {
        selector : selector,
        node     : Nodes.findOne({ staticId: currentNodeId, projectVersionId: adventure.projectVersionId }),
        adventure: adventure
      };
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

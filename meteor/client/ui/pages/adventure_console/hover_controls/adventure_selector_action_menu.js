import './adventure_selector_action_menu.html';
import { Template } from 'meteor/templating';
import { NodeReadyCheckFns } from '../../../../../imports/api/nodes/node_ready_check_fns.js';
import { NodeValidCheckFns } from '../../../../../imports/api/nodes/node_valid_check_fns.js';
import './adventure_selector_action_target_menu.js';

/**
 * Template Helpers
 */
Template.AdventureSelectorActionMenu.helpers({
  readyCheckFns () {
    return _.values(NodeReadyCheckFns)
  },
  validCheckFns () {
    return _.values(NodeValidCheckFns)
  },
  getSelector () {
    let selector = this.selector;
    if(selector){
      return selector.selector || selector;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureSelectorActionMenu.events({});

/**
 * Template Created
 */
Template.AdventureSelectorActionMenu.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureSelectorActionMenu.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureSelectorActionMenu.onDestroyed(() => {
  
});

import './adventure_selector_action_target_menu.html';
import { Template } from 'meteor/templating';
import { Actions } from '../../../../imports/api/action/action.js';
import { Nodes } from '../../../../imports/api/node/node.js';

/**
 * Template Helpers
 */
Template.AdventureSelectorActionTargetMenu.helpers({
  getActions () {
    var node = (this.type && this.type == NodeTypes.navMenu) ? this : this.node;
    if (node) {
      return Actions.find({ nodeId: node.staticId, projectVersionId: node.projectVersionId }, { sort: { title: 1 } });
    }
  },
  getNavMenus () {
    if (this.node && this.node.navMenus) {
      return Nodes.find({
        staticId        : { $in: this.node.navMenus },
        projectVersionId: this.node.projectVersionId
      }, { sort: { title: 1 } });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureSelectorActionTargetMenu.events({});

/**
 * Template Created
 */
Template.AdventureSelectorActionTargetMenu.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureSelectorActionTargetMenu.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureSelectorActionTargetMenu.onDestroyed(() => {
  
});

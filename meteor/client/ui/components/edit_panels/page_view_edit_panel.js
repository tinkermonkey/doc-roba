import './page_view_edit_panel.html';
import { Template } from 'meteor/templating';
import { NodeCheckTypes } from '../../../../imports/api/node/node_check_types.js';
import '../editable_fields/editable_node_type.js';
import '../editable_fields/editable_code/editable_code.js';
import '../editable_fields/editable_nav_menu_list.js';
import '../node_checks/node_check_edit_list.js';

/**
 * Template Helpers
 */
Template.PageViewEditPanel.helpers({
  editParamsPanel(){
    let platformType = this.platformType();
    if (platformType) {
      return platformType.nodeEditParamsTemplate();
    }
  },
  checkTypes(){
    return NodeCheckTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.PageViewEditPanel.events({});

/**
 * Template Created
 */
Template.PageViewEditPanel.created = function () {
  
};

/**
 * Template Rendered
 */
Template.PageViewEditPanel.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.PageViewEditPanel.destroyed = function () {
  
};

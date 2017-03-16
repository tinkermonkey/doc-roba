import './page_view_edit_panel.html';
import { Template } from 'meteor/templating';
import { NodeChecks } from '../../../../imports/api/nodes/node_checks.js';
import { NodeCheckTypes } from '../../../../imports/api/nodes/node_check_types.js';
import './node_recent_renditions.js';
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
      return platformType.templates.nodeEditDetails;
    }
  },
  checkTypes(){
    return NodeCheckTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.PageViewEditPanel.events({
  "click .btn-add-check"(e, instance){
    let node = instance.data,
        type = $(e.target).closest(".btn").attr("data-check-type");
  
    console.log("PageViewEditPanel click btn-add-check:", type, node);
    if(type && node && node.staticId){
      // Determine the order
      let order = NodeChecks.find({projectVersionId: node.projectVersionId, parentId: node.staticId, type: NodeCheckTypes[type]}).count();
      
      // Insert an empty check
      NodeChecks.insert({
        projectId: node.projectId,
        projectVersionId: node.projectVersionId,
        parentId: node.staticId,
        type: NodeCheckTypes[type],
        order: order
      }, (error) => {
        if(error){
          console.error(error);
          RobaDialog.error("Failed to insert node check: " + error.message);
        }
      });
    }
  }
});

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

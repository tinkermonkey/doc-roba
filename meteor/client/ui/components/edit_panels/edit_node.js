import './edit_node.html';
import './edit_node.css';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {Nodes} from '../../../../imports/api/node/node.js';
import {NodeTypes} from '../../../../imports/api/node/node_types.js';

import './root_edit_panel.js';
import './user_type_edit_panel.js';
import './platform_edit_panel.js';
import './nav_menu_edit_panel.js';
import './page_view_edit_panel.js';

/**
 * Template helpers
 */
Template.EditNode.helpers({
  getNodeRecord() {
    return Nodes.findOne({_id: this._id});
  },
  isVisitable() {
    return this.type == NodeTypes.page || this.type == NodeTypes.view
  },
  getEditPanel() {
    switch (this.type) {
      case NodeTypes.root:
        return "RootEditPanel";
      case NodeTypes.userType:
        return "UserTypeEditPanel";
      case NodeTypes.platform:
        return "PlatformEditPanel";
      case NodeTypes.navMenu:
        return "NavMenuEditPanel";
      case NodeTypes.page:
      case NodeTypes.view:
        return "PageViewEditPanel";
    }
  }
});

/**
 * React to the template being rendered
 */
Template.EditNode.events({
  "edited .editable"(e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};

    console.log("update: ", dataKey, instance.data._id);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      Nodes.update(instance.data._id, update, function (error) {
        if(error){
          console.error("Failed to update node value: " + error.message);
          RobaDialog.error("Failed to update node value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update node value: data-key not found");
      RobaDialog.error("Failed to update node value: data-key not found");
    }
  }
});

/**
 * Set the editable components
 */
Template.EditNode.rendered = function () {

};

/**
 * React to the template being destroyed
 */
Template.EditNode.destroyed = function () {
};
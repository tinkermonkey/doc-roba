import './current_location_actions.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Actions } from '../../../../../imports/api/action/action.js';
import { Nodes } from '../../../../../imports/api/node/node.js';
import './adventure_edit_node_action_row.js';
import '../../../components/editable_fields/editable_nav_menu_list.js';

/**
 * Template Helpers
 */
Template.CurrentLocationActions.helpers({
  getActions () {
    return Actions.find({ nodeId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  },
  getNodeNavMenus () {
    var navs = [],
        node = this;
    _.each(node.navMenus, function (navMenuId) {
      var nav = Nodes.findOne({ staticId: navMenuId, projectVersionId: node.projectVersionId });
      if (nav) {
        nav.actions = Actions.find({
          nodeId          : navMenuId,
          projectVersionId: node.projectVersionId
        }, { sort: { title: 1 } });
        navs.push(nav);
      } else {
        console.error("NavMenu node not found: ", navMenuID);
      }
    });
    return navs
  },
  currentNode () {
    let context = Template.instance().context,
        nodeId  = context.currentNodeId.get();
    if (nodeId) {
      return Nodes.findOne({ staticId: nodeId, projectVersionId: context.adventure.get().projectVersionId });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentLocationActions.events({
  "click .btn-close-edit-action-form" (e, instance) {
    var view          = Blaze.getView($(e.target).closest(".edit-action-form").get(0)),
        formContainer = $(e.target).closest(".edit-action-form-container"),
        actionRow     = formContainer.prev();
    
    formContainer.addClass("hide");
    actionRow.find(".btn-edit-action").removeAttr("disabled");
    actionRow.removeClass("disabled");
    
    Blaze.remove(view);
  },
  "click .btn-add-action" (e, instance) {
    e.stopImmediatePropagation();
    var node = this;
    
    if (node && node._id) {
      Actions.insert({
        projectId       : node.projectId,
        projectVersionId: node.projectVersionId,
        nodeId          : node.staticId,
        routes          : [ {
          order : 0,
          nodeId: node.staticId
        } ],
        title           : 'New Action'
      }, function (error, result) {
        if (error) {
          RobaDialog.error("Adding Action failed: " + error.message);
        }
      });
    } else {
      RobaDialog.error("Adding Action failed, no node found");
    }
  }
});

/**
 * Template Created
 */
Template.CurrentLocationActions.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CurrentLocationActions.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CurrentLocationActions.onDestroyed(() => {
  
});

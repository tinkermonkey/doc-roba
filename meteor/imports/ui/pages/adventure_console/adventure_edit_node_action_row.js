import './adventure_edit_node_action_row.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Actions } from '../../../api/action/action.js';
import { AdventureCommands } from '../../../api/adventure/adventure_command.js';
import { AdventureStatus } from '../../../api/adventure/adventure_status.js';
import './adventure_edit_action_form.js';
import '../../lib/dialogs/modals.js';

/**
 * Template Helpers
 */
Template.AdventureEditNodeActionRow.helpers({
  actionWithScale () {
    this.scale = 0.5;
    return this;
  },
  getAdventureContext () {
    var i = 0, context = Template.parentData(i);
    while (i < 10 && context) {
      context = Template.parentData(i++);
      if (context.adventure && context.adventure.status) {
        return context;
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeActionRow.events({
  "click .btn-edit-action" (e, instance) {
    var action    = this,
        actionRow = $(e.target).closest(".edit-node-action-row"),
        formRow   = actionRow.next();
    
    if (formRow.hasClass("hide")) {
      actionRow.addClass("disabled");
      formRow.removeClass("hide");
      Blaze.renderWithData(Template.AdventureEditActionForm, action, formRow.get(0));
      $(e.target).closest("button").attr("disabled", "disabled");
    }
  },
  "click .btn-execute-action" (e, instance) {
    // make sure there's an adventure to work with
    var adventure = Util.findParentData("adventure"),
        code      = this.code;
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    console.log("Execute Action: ", code);
    if (code.length) {
      AdventureCommands.insert({
        projectId  : adventure.projectId,
        adventureId: adventure._id,
        code       : code
      }, function (error) {
        if (error) {
          RobaDialog.error("Error executing action: " + error.message);
        }
      });
    }
  },
  "click .btn-delete-action" () {
    var action = this;
    console.log("Delete Action: ", action);
    
    RobaDialog.show({
      title          : "Delete Action?",
      contentTemplate: "confirm_delete_action_modal",
      contentData    : action,
      width          : 400,
      buttons        : [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback (btn) {
        //console.log("Dialog button pressed: ", btn);
        if (btn == "Delete") {
          Actions.remove(action._id, function (error, result) {
            if (error) {
              RobaDialog.hide();
              RobaDialog.error("Failed to delete action: " + error.message);
            } else {
              console.debug("Action deleted: " + result);
            }
            RobaDialog.hide();
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  }
});

/**
 * Template Created
 */
Template.AdventureEditNodeActionRow.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureEditNodeActionRow.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureEditNodeActionRow.onDestroyed(() => {
  
});

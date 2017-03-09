import './current_location_action_row.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Actions } from '../../../../../imports/api/actions/actions.js';
import { AdventureStatus } from '../../../../../imports/api/adventures/adventure_status.js';
import { Util } from '../../../../../imports/api/util.js';
import './edit_action_form.js';
import '../../../lib/dialogs/modals.js';

/**
 * Template Helpers
 */
Template.CurrentLocationActionRow.helpers({
  actionWithScale () {
    this.scale = 0.5;
    return this;
  },
  getAdventureContext () {
    var i = 0, context = Template.parentData(i);
    while (i < 10 && context) {
      context = Template.parentData(i++);
      if (context.adventure && context.adventure.get().status) {
        return context;
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentLocationActionRow.events({
  "click .btn-edit-action" (e, instance) {
    var action    = this,
        actionRow = $(e.target).closest(".current-location-action-row"),
        formRow   = actionRow.next();
    
    if (formRow.hasClass("hide")) {
      actionRow.addClass("disabled");
      formRow.removeClass("hide");
      Blaze.renderWithData(Template.EditActionForm, action, formRow.get(0));
      $(e.target).closest("button").attr("disabled", "disabled");
    }
  },
  "click .btn-execute-action" (e, instance) {
    // make sure there's an adventure to work with
    var adventure = Util.findParentData("adventure").get(),
        code      = '',
        action    = this;
    console.log("Execute Action: ", action);
    // build up the code to define the action variables using the default values
    if (action.variables && action.variables.length) {
      code += 'var ' + (_.map(action.variables, (variable) => {
            return variable.name + ' = ' + (variable.defaultValue || '""')
          })).join(",\r\n    ") + ";\r\n";
    }
    
    // Add in the code for the action
    code += action.code;
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    if (code.length) {
      adventure.assistant().executeCommand(adventure, code, (error, command) => {
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
Template.CurrentLocationActionRow.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CurrentLocationActionRow.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CurrentLocationActionRow.onDestroyed(() => {
  
});

import './edit_action_form.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Actions } from '../../../../../imports/api/actions/actions.js';
import '../../../components/editable_fields/editable_code/editable_code.js';
import '../../../components/edit_panels/action_edit_variables.js';
import '../../../components/edit_panels/action_edit_routes.js';

/**
 * Template Helpers
 */
Template.EditActionForm.helpers({
  // sometimes the action record end up being non-reactive
  getActionRecord () {
    return Actions.findOne(this._id);
  }
});

/**
 * Template Event Handlers
 */
Template.EditActionForm.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var target  = $(e.target),
        dataKey = target.attr("data-key"),
        update  = { $set: {} };
    
    if (dataKey) {
      update[ "$set" ][ dataKey ] = newValue;
      //console.log("Edited: ", dataKey, newValue, update, instance.data);
      Actions.update(instance.data._id, update, function (error) {
        if (error) {
          RobaDialog.error("Failed to update action value: " + error.message);
        }
      });
    } else {
      RobaDialog.error("Failed to update action value: data-key not found");
    }
  }
});

/**
 * Template Created
 */
Template.EditActionForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditActionForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditActionForm.onDestroyed(() => {
  
});

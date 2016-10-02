import './editable_radio_button.html';
import './editable_radio_button.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableRadioButton.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableRadioButton.events({
  "click .editable-radio-button"(e, instance){
    console.log("Click:", e.target);
    $(e.target).closest(".editable").trigger("edited", [ true ]);
  }
});

/**
 * Template Created
 */
Template.EditableRadioButton.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableRadioButton.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableRadioButton.onDestroyed(() => {
  
});

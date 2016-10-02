import './editable_checkbox.html';
import './editable_checkbox.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableCheckbox.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableCheckbox.events({
  "click .editable-checkbox"(e, instance){
    let value = this.value ? true : false;
    $(e.target).closest(".editable").trigger("edited", [ !value ]);
  }
});

/**
 * Template Created
 */
Template.EditableCheckbox.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableCheckbox.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableCheckbox.onDestroyed(() => {
  
});

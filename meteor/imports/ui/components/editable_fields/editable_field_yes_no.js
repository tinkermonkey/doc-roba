import './editable_field_yes_no.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableFieldYesNo.helpers({});

/**
 * Template Helpers
 */
Template.EditableFieldYesNo.events({});

/**
 * Template Rendered
 */
Template.EditableFieldYesNo.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-is-yes-no').editable({
    mode: "inline",
    type: "select",
    source: [{value: 0, text: 'No'}, {value: 1, text: 'Yes'}],
    value: instance.data.value ? 1 : 0,
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue == 1]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable-is-yes-no").editable("setValue", data.value ? 1 : 0);
  });

};

/**
 * Template Destroyed
 */
Template.EditableFieldYesNo.destroyed = function () {

};

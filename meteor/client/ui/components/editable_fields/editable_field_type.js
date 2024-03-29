import './editable_field_type.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {FieldTypesLookup} from '../../../../imports/api/datastores/field_types.js';

/**
 * Template Helpers
 */
Template.EditableFieldType.helpers({});

/**
 * Template Helpers
 */
Template.EditableFieldType.events({});

/**
 * Template Rendered
 */
Template.EditableFieldType.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-field-type').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: _.map(_.keys(FieldTypesLookup), function (typeId) {
      return {value: typeId, text: FieldTypesLookup[typeId]};
    }),
    highlight: false,
    display() {
    },
    success(response, newValue) {
      var editedElement = this;
      if (FieldTypesLookup[newValue]) {
        $(editedElement).trigger("edited", [newValue]);
      } else {
        RobaDialog.error("Variable type update failed. Variable type not known: " + newValue);
      }

      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$('.editable-field-type').editable("setValue", data.type);
  });
};

/**
 * Template Destroyed
 */
Template.EditableFieldType.destroyed = function () {

};

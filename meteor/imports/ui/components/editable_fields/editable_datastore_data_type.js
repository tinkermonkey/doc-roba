import './editable_datastore_data_type.html';

import {Template} from 'meteor/templating';

import {FieldTypes} from '../../../api/datastore/field_types.js';
import {DatastoreDataTypes} from '../../../api/datastore/datastore_data_type.js';

/**
 * Template Helpers
 */
Template.EditableDatastoreDataType.helpers({
  isCustom() {
    return this.type === FieldTypes.custom;
  }
});

/**
 * Template Helpers
 */
Template.EditableDatastoreDataType.events({});

/**
 * Template Rendered
 */
Template.EditableDatastoreDataType.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      types = DatastoreDataTypes.find({
        projectVersionId: instance.data.projectVersionId
      }, {sort: {title: 1}}).map(function (type) {
        return { value: type.staticId, text: type.title };
      });

    instance.$('.editable-datastore-data-type').editable({
      mode: instance.data.mode || "inline",
      type: "select",
      source: types,
      highlight: false,
      display() {},
      success(response, newValue) {
        var editedElement = this;
        $(editedElement).trigger("edited", [newValue]);
        setTimeout(function () {
          $(editedElement).removeClass('editable-unsaved');
        }, 10);
      }
    });
    instance.$('.editable-datastore-data-type').editable("option", "source", types);
    instance.$('.editable-datastore-data-type').editable("setValue", data.dataTypeId, true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableDatastoreDataType.destroyed = function () {

};

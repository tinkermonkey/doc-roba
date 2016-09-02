import './datastore_child_table.html';

import {Template} from 'meteor/templating';

import {FieldTypes} from '../../../api/datastore/field_types.js';

/**
 * Template Helpers
 */
Template.DatastoreChildTable.helpers({
  isPrimaryColumn: function () {
    return this.type !== FieldTypes.custom;
  },
  isChildColumn: function () {
    return this.type === FieldTypes.custom;
  },
  getPrimaryColumnCount: function () {
    return _.filter(this.fields, function(field){return field.type !== FieldTypes.custom}).length;
  },
  getFieldValue: function (field, row) {
    if(field && row){
      return row[field.dataKey];
    } else {
      console.error("getFieldValue: ", field, row);
    }
  },
  childHasValue: function (field, row) {
    return row.hasOwnProperty(field.dataKey);
  },
  getChildColSpan: function (schema) {
    console.log("getChildColSpan:", schema);
    return _.filter(schema.fields, function(field){return field.type !== FieldTypes.custom}).length - 1;
  },
  getChildContext: function (field, row) {
    var value = row[field.dataKey];
    return {
      field: field,
      values: _.isArray(value) ? value : [value]
    };
  }
});

/**
 * Template Helpers
 */
Template.DatastoreChildTable.events({});

/**
 * Template Created
 */
Template.DatastoreChildTable.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.DatastoreChildTable.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.DatastoreChildTable.onDestroyed(() => {

});

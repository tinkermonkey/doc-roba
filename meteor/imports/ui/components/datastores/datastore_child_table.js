import './datastore_child_table.html';

import {Template} from 'meteor/templating';

import {FieldTypes} from '../../../api/datastore/field_types.js';

/**
 * Template Helpers
 */
Template.DatastoreChildTable.helpers({
  getTableSchema: function () {
    return this.schema;
  },
  isPrimaryColumn: function () {
    return this.type !== FieldTypes.custom;
  },
  isChildColumn: function () {
    return this.type === FieldTypes.custom;
  },
  getPrimaryColumnCount: function () {
    return _.filter(this.fields, function(field){return field.type !== FieldTypes.custom}).length;
  },
  getRows: function (context) {
    return context.rows;
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
    return _.filter(schema.fields, function(field){return field.type !== FieldTypes.custom}).length - 1;
  },
  getChildContext: function (field, row) {
    var value = row[field.dataKey];
    return {
      schema: field.schema,
      rows: _.isArray(value) ? value : [value]
    };
  }
});

/**
 * Template Helpers
 */
Template.DatastoreChildTable.events({});

/**
 * Template Rendered
 */
Template.DatastoreChildTable.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.DatastoreChildTable.destroyed = function () {

};

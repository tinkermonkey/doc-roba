import './data_store_row_form_vert.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.DataStoreRowFormVert.helpers({
  schemaFields: function () {
    if(this.rowSchema && this.rowSchema.schema){
      var schema = this.rowSchema.schema();
      return _.keys(schema).map(function (key) { return {name: key} });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.DataStoreRowFormVert.events({});

/**
 * Template Created
 */
Template.DataStoreRowFormVert.created = function () {
  
};

/**
 * Template Rendered
 */
Template.DataStoreRowFormVert.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.DataStoreRowFormVert.destroyed = function () {
  
};

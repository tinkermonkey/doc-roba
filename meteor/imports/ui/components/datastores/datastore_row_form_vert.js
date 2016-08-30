import './datastore_row_form_vert.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.DatastoreRowFormVert.helpers({
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
Template.DatastoreRowFormVert.events({});

/**
 * Template Created
 */
Template.DatastoreRowFormVert.created = function () {
  
};

/**
 * Template Rendered
 */
Template.DatastoreRowFormVert.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.DatastoreRowFormVert.destroyed = function () {
  
};

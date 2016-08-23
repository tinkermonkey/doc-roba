import './data_store_data_table.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {DSUtil, DataStoreSchemas} from '../../../api/datastore/ds_util.js';
import {FieldTypes} from '../../../api/datastore/field_types.js';
import {DataStoreRows} from '../../../api/datastore/datastore_row.js';

import '../../components/data_stores/data_store_row_form.js';

/**
 * Template Helpers
 */
Template.DataStoreDataTable.helpers({
  getTableSchema: function () {
    // TODO: Make this reactive, if the schema changes this is not re-running
    return DSUtil.flexSchema(this._id);
  },
  isPrimaryColumn: function () {
    return this.type !== FieldTypes.custom;
  },
  isChildColumn: function () {
    return this.type === FieldTypes.custom;
  },
  getPrimaryColumnCount: function () {
    return _.filter(this.fields, function(field){return field.type !== FieldTypes.custom}).length + 2;
  },
  getRows: function () {
    return DataStoreRows.find({dataStoreId: this._id}, {sort: {dateCreated: 1}});
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
    return _.filter(schema.fields, function(field){return field.type !== FieldTypes.custom}).length - 2;
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
Template.DataStoreDataTable.events({
  "click .btn-add-ds-row": function (e, instance) {
    var dataStoreId = $(e.target).attr("data-store-id");

    // Build the form context
    var formContext = {
      type: "insert",
      dataStore: instance.data,
      rowSchema: DataStoreSchemas[dataStoreId],
      rowData: {}
    };

    console.log("Add Row: ", dataStoreId, formContext);

    // render the form
    RobaDialog.show({
      contentTemplate: 'DataStoreRowForm',
      contentData: formContext,
      title: "New " + instance.data.title + " row",
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn) {
        //console.log("RobaDialog button pressed: ", btn);
        if(btn == "Save"){
          // grab the form data
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if(formId){
            var updateDoc = _.clone(AutoForm.getFormValues(formId).insertDoc),
              initialData = {
                dataStoreId:      formContext.dataStore._id,
                projectId:        formContext.dataStore.projectId,
                projectVersionId: formContext.dataStore.projectVersionId
            };
            //console.log("Saving form ", initialData, AutoForm.getFormValues(formId), updateDoc);

            // Create a straw record without most of the data
            DataStoreRows.insert(initialData, function (error, recordId) {
              if(error){
                console.error("DataStoreRow initial insert failed: ", error);
              } else {
                //console.log("DataStoreRow initial insert successful: ", recordId, updateDoc);

                Meteor.call("updateDataStoreRow", recordId, updateDoc, function (error, response) {
                  if(error){
                    console.error("DataStoreRow insert update failed: ", error);
                  } else {
                    console.log("DataStoreRow insert update succeeded:", recordId);
                  }
                });
              }
              RobaDialog.hide();
            });
          } else {
            console.error("Save failed: could not find form");
          }
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "click .btn-edit-row": function (e, instance) {
    console.log("Edit: ", this);
    var row = this;

    // Build the form context
    var formContext = {
      type: "update",
      dataStore: instance.data,
      rowSchema: DataStoreSchemas[row.dataStoreId],
      rowData: row
    };

    // render the form
    RobaDialog.show({
      contentTemplate: 'DataStoreRowForm',
      contentData: formContext,
      title: "Edit " + instance.data.title + " row",
      //width: 600,
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn) {
        //console.log("RobaDialog button pressed: ", btn);
        if(btn == "Save"){
          // grab the form data
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if(formId){
            var updateDoc = _.clone(AutoForm.getFormValues(formId).updateDoc);

            Meteor.call("updateDataStoreRow", row._id, updateDoc["$set"], function (error, response) {
              if(error){
                console.error("DataStoreRow insert update failed: ", error);
              } else {
                console.log("DataStoreRow insert update succeeded:", row._id);
              }
            });
            RobaDialog.hide();
          } else {
            console.error("Save failed: could not find form");
          }
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "click .btn-delete-row": function (e, instance) {
    console.log("Delete: ", this);
    var row = this,
        rowTitle = DSUtil.renderRow(row._id);
  
    RobaDialog.show({
      title: "Delete Field?",
      text: "Are you sure that you want to delete the " + instance.data.title + " <span class='label label-primary'>" + rowTitle + "</span> from this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        if(btn == "Delete"){
          DataStoreRows.remove(row._id, function (error, response) {
            RobaDialog.hide();
            if(error){
              RobaDialog.error("Delete datastore row failed: " + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.DataStoreDataTable.onRendered(() => {
  var self = Template.instance();

  // make sure the simple schema is up-to-date so that the forms works
  if(self.data.schema){
    DataStoreSchemas[self.data._id] = DSUtil.simpleSchema(self.data.schema);
  }
});

/**
 * Template Destroyed
 */
Template.DataStoreDataTable.destroyed = function () {

};

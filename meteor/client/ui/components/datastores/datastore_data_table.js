import './datastore_data_table.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FieldTypes } from '../../../../imports/api/datastore/field_types.js';
import { DatastoreRows } from '../../../../imports/api/datastore/datastore_row.js';
import './datastore_row_form.js';
import './datastore_child_table.js';

/**
 * Template Helpers
 */
Template.DatastoreDataTable.helpers({
  isPrimaryColumn() {
    return this.type !== FieldTypes.custom;
  },
  isChildColumn() {
    return this.type === FieldTypes.custom;
  },
  getPrimaryColumnCount() {
    return _.filter(this.tableSchema().fields, function (field) {
          return field.type !== FieldTypes.custom
        }).length + 2;
  },
  getFieldValue(field, row) {
    if (field && row) {
      return row[ field.dataKey ];
    }
  },
  childHasValue(field, row) {
    return row.hasOwnProperty(field.dataKey);
  },
  getChildColSpan(schema) {
    return _.filter(schema.fields, function (field) {
      return field.type !== FieldTypes.custom
    }).length;
  },
  getChildContext(field, row) {
    var value = row[ field.dataKey ];
    return {
      field : field,
      values: _.isArray(value) ? value : [ value ]
    };
  }
});

/**
 * Template Helpers
 */
Template.DatastoreDataTable.events({
  "click .btn-add-ds-row"(e, instance) {
    var dataStoreId = $(e.target).attr("data-store-id"),
        formContext = {
          type     : "insert",
          dataStore: instance.data,
          rowSchema: instance.cachedSimpleSchema.get(),
          rowData  : {}
        };
    
    console.log("Add Row: ", dataStoreId, formContext);
    
    // render the form
    RobaDialog.show({
      contentTemplate: 'DatastoreRowForm',
      contentData    : formContext,
      title          : "New " + instance.data.title + " row",
      buttons        : [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback(btn) {
        //console.log("RobaDialog button pressed: ", btn);
        if (btn == "Save") {
          // grab the form data
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if (formId) {
            var updateDoc   = _.clone(AutoForm.getFormValues(formId).insertDoc),
                initialData = {
                  dataStoreId     : formContext.dataStore.staticId,
                  projectId       : formContext.dataStore.projectId,
                  projectVersionId: formContext.dataStore.projectVersionId
                };
            console.log("Saving form ", initialData, AutoForm.getFormValues(formId), updateDoc);
            
            // Create a straw record without most of the data
            DatastoreRows.insert(initialData, function (error, recordId) {
              if (error) {
                console.error("DatastoreRow initial insert failed: ", error);
              } else {
                //console.log("DatastoreRow initial insert successful: ", recordId, updateDoc);
                
                Meteor.call("updateDatastoreRow", recordId, updateDoc, function (error) {
                  if (error) {
                    RobaDialog.error("DatastoreRow insert update failed: " + error.toString());
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
  "click .btn-edit-row, dblclick .data-store-table-row"(e, instance) {
    console.log("Edit: ", this);
    var row = this;
    
    // Build the form context
    var formContext = {
      type     : "update",
      dataStore: instance.data,
      rowSchema: instance.cachedSimpleSchema.get(),
      rowData  : row
    };
    
    // render the form
    RobaDialog.show({
      contentTemplate: 'DatastoreRowForm',
      contentData    : formContext,
      title          : "Edit " + instance.data.title + " row",
      //width: 600,
      buttons        : [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback(btn) {
        //console.log("RobaDialog button pressed: ", btn);
        if (btn == "Save") {
          // grab the form data
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if (formId) {
            var updateDoc = _.clone(AutoForm.getFormValues(formId).updateDoc);
            
            Meteor.call("updateDatastoreRow", row._id, updateDoc[ "$set" ], function (error) {
              if (error) {
                RobaDialog.error("DatastoreRow insert update failed: " + error.toString());
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
  "click .btn-delete-row"(e, instance) {
    console.log("Delete: ", this);
    var row      = this,
        rowTitle = row.render(row._id);
    
    RobaDialog.show({
      title  : "Delete Field?",
      text   : "Are you sure that you want to delete the " + instance.data.title + " <span class='label label-primary'>" + rowTitle + "</span> from this version?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        if (btn == "Delete") {
          DatastoreRows.remove(row._id, function (error) {
            RobaDialog.hide();
            if (error) {
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
 * Template created
 */
Template.DatastoreDataTable.onCreated(() => {
  let instance                = Template.instance();
  instance.cachedSimpleSchema = new ReactiveVar();

  instance.autorun(() => {
    let datastore = Template.currentData();
    
    instance.subscribe("datastore_fields", datastore.projectId, datastore.projectVersionId, datastore.staticId);
    instance.subscribe("datastore_rows", datastore.projectId, datastore.projectVersionId, datastore.staticId);

    if (instance.subscriptionsReady()) {
      instance.cachedSimpleSchema.set(datastore.simpleSchema());
    }
  })
});

/**
 * Template Rendered
 */
Template.DatastoreDataTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DatastoreDataTable.onDestroyed(() => {
  
});

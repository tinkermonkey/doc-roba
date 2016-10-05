import './datastore_data_type_field_list.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Util } from '../../../../imports/api/util.js';
import { DatastoreDataTypes } from '../../../../imports/api/datastore/datastore_data_type.js';
import { DatastoreDataTypeFields } from '../../../../imports/api/datastore/datastore_data_type_field.js';
import { FieldTypes } from '../../../../imports/api/datastore/field_types.js';
import '../editable_fields/editable_enum selector.js';
import '../editable_fields/editable_record_selector.js';

/**
 * Template Helpers
 */
Template.DatastoreDataTypeFieldList.helpers({
  DatastoreDataTypes(){
    return DatastoreDataTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.DatastoreDataTypeFieldList.events({
  "click .btn-add-field"() {
    var instance = Template.instance(),
        order    = parseInt(instance.$(".sortable-table-row").length || 0) + 1;
    
    DatastoreDataTypeFields.insert({
      title           : "New Field",
      dataKey         : "new_field",
      type            : FieldTypes.string,
      fieldIsArray    : false,
      order           : order,
      parentId        : instance.data.staticId,
      projectId       : instance.data.projectId,
      projectVersionId: instance.data.projectVersionId
    }, function (error, response) {
      if (error) {
        RobaDialog.error("Insert Field failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".data-store-field[data-pk='" + response + "'] .editable[data-key='title']").editable("show");
        }, 100);
      }
    });
  },
  "click .sortable-table-row .btn-delete"(e, instance) {
    var field = this;
    console.log("Delete Field: ", field);
    
    RobaDialog.show({
      title  : "Delete Field?",
      text   : "Are you sure that you want to delete the field <span class='label label-primary'>" + field.title + "</span> from this data type?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        if (btn == "Delete") {
          DatastoreDataTypeFields.remove(field._id, function (error) {
            RobaDialog.hide();
            if (error) {
              RobaDialog.error("Delete Field failed: " + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "edited .editable"(e, instance, newValue) {
    console.log("Data Store Field update: ", $(e.target).attr("data-key"));
    
    e.stopImmediatePropagation();
    
    var fieldId                 = $(e.target).closest(".sortable-table-row").attr("data-pk"),
        dataKey                 = $(e.target).attr("data-key"),
        update                  = { $set: {} };
    update[ "$set" ][ dataKey ] = newValue;
    
    // a few situations to check for
    if (dataKey == "title") {
      // update the datakey with the title
      update[ "$set" ][ "dataKey" ] = Util.dataKey(newValue);
    } else if (dataKey == "type") {
      // null the custom type if the type is not custom
      if (newValue != FieldTypes.custom) {
        update[ "$unset" ] = { dataTypeId: "" };
      }
    }
    
    DatastoreDataTypeFields.update(fieldId, update, function (error) {
      if (error) {
        RobaDialog.error("Datastore Field update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.DatastoreDataTypeFieldList.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.DatastoreDataTypeFieldList.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DatastoreDataTypeFieldList.onDestroyed(() => {
  
});

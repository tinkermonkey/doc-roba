import './datastore_field_list.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';
import {EditableTextField} from 'meteor/austinsand:editable-text-field';

import {FieldTypes} from '../../../api/datastore/field_types.js';
import {DatastoreFields} from '../../../api/datastore/datastore_field.js';

import {Util} from '../../../api/util.js';
import '../editable_fields/editable_field_type.js';
import '../editable_fields/editable_datastore_data_type.js';
import '../editable_fields/editable_field_shape.js';

/**
 * Template Helpers
 */
Template.DatastoreFieldList.helpers({

});

/**
 * Template Helpers
 */
Template.DatastoreFieldList.events({
  "click .btn-add-field": function () {
    var instance = Template.instance(),
      order = parseInt(instance.$(".sortable-table-row").length || 0) + 1;

    DatastoreFields.insert({
      title: "New Field",
      dataKey: "new_field",
      type: FieldTypes.string,
      fieldIsArray: false,
      order: order,
      dataStoreId: instance.data.staticId,
      projectId: instance.data.projectId,
      projectVersionId: instance.data.projectVersionId
    }, function (error, response) {
      if(error){
        RobaDialog.error("Insert Field failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".data-store-field[data-pk='" + response + "'] .editable[data-key='title']").editable("show");
        }, 100);
      }
    });
  },
  "click .sortable-table-row .btn-delete": function (e, instance) {
    var field = this;
    console.log("Delete Field: ", field);

    RobaDialog.show({
      title: "Delete Field?",
      text: "Are you sure that you want to delete the field <span class='label label-primary'>" + field.title + "</span> from this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        if(btn == "Delete"){
          DatastoreFields.remove(field._id, function (error, response) {
            RobaDialog.hide();
            if(error){
              RobaDialog.error("Delete Field failed: " + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "edited .editable": function (e, instance, newValue) {
    console.log("Data Store Field update: ", $(e.target).attr("data-key"));

    e.stopImmediatePropagation();

    var fieldId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;

    // a few situations to check for
    if(dataKey == "title"){
      // update the datakey with the title
      update["$set"]["dataKey"] = Util.dataKey(newValue);
    } else if (dataKey == "type") {
      // null the custom type if the type is not custom
      if(newValue != FieldTypes.custom) {
        update["$unset"] = {dataTypeId: ""};
      }
    }

    DatastoreFields.update(fieldId, update, function (error) {
      if(error){
        RobaDialog.error("Datastore Field update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.DatastoreFieldList.rendered = function () {
  var instance = Template.instance();

  // Make the field list sortable
  instance.$(".sortable-table")
    .sortable({
      items: "> .sortable-table-row",
      handle: ".drag-handle",
      helper: function(e, ui) {
        // fix the width
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui;
      },
      axis: "y",
      update: function (event, ui) {
        instance.$(".data-store-field").each(function (i, el) {
          var newOrder = i + 1,
            oldOrder = parseInt($(el).attr("data-field-order")),
            fieldId = $(el).attr("data-pk");
          if(newOrder != oldOrder){
            DatastoreFields.update(fieldId, {$set: {order: newOrder}}, function (error, response) {
              if(error){
                RobaDialog.error("Datastore Field order update failed: " + error.message);
              }
            });
          }
        });
      }
    })
    .disableSelection();
};

/**
 * Template Destroyed
 */
Template.DatastoreFieldList.destroyed = function () {

};

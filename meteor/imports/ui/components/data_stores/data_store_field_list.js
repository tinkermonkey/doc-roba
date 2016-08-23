import './data_store_field_list.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';
import {EditableTextField} from 'meteor/austinsand:editable-text-field';

import {FieldTypes} from '../../../api/datastore/field_types.js';
import {DataStoreFields} from '../../../api/datastore/datastore_field.js';

import {Util} from '../../../api/util.js';
import '../editable_fields/editable_field_type.js';
import '../editable_fields/editable_custom_field_type.js';
import '../editable_fields/editable_field_shape.js';

/**
 * Template Helpers
 */
Template.DataStoreFieldList.helpers({
  getFields: function () {
    if(this._id){
      return DataStoreFields.find({dataStoreId: this._id}, {sort: {order: 1}});
    }
  }
});

/**
 * Template Helpers
 */
Template.DataStoreFieldList.events({
  "click .btn-add-field": function () {
    var instance = Template.instance(),
      order = parseInt(instance.$(".sortable-table-row").length || 0) + 1;

    DataStoreFields.insert({
      title: "New Field",
      dataKey: "new_field",
      type: FieldTypes.string,
      fieldIsArray: false,
      order: order,
      dataStoreId: instance.data._id,
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
    console.log("Delete Field: ", field);

    var field = this;
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
          DataStoreFields.remove(field._id, function (error, response) {
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
        update["$unset"] = {customFieldType: ""};
      }
    }

    DataStoreFields.update(fieldId, update, function (error) {
      if(error){
        RobaDialog.error("DataStore Field update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.DataStoreFieldList.rendered = function () {
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
            DataStoreFields.update(fieldId, {$set: {order: newOrder}}, function (error, response) {
              if(error){
                RobaDialog.error("DataStore Field order update failed: " + error.message);
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
Template.DataStoreFieldList.destroyed = function () {

};

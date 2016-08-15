/**
 * Template Helpers
 */
Template.data_store_data_table.helpers({
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
    return _.filter(this.fields, function(field){return field.type !== FieldTypes.custom}).length + 1;
  },
  getRows: function () {
    return Collections.DataStoreRows.find({dataStoreId: this._id}, {sort: {dateCreated: 1}});
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
Template.data_store_data_table.events({
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
    Dialog.show({
      contentTemplate: 'DataStoreRowForm',
      contentData: formContext,
      title: "New " + instance.data.title + " row",
      //width: 600,
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Save"){
          // grab the form data
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId){
            var updateDoc = _.clone(AutoForm.getFormValues(formId).insertDoc),
              initialData = {
                dataStoreId:      formContext.dataStore._id,
                projectId:        formContext.dataStore.projectId,
                projectVersionId: formContext.dataStore.projectVersionId
            };
            //console.log("Saving form ", initialData, AutoForm.getFormValues(formId), updateDoc);

            // Create a straw record without most of the data
            Collections.DataStoreRows.insert(initialData, function (error, recordId) {
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
              Dialog.hide();
            });
          } else {
            console.error("Save failed: could not find form");
          }
        } else {
          Dialog.hide();
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
    Dialog.show({
      contentTemplate: 'DataStoreRowForm',
      contentData: formContext,
      title: "Edit " + instance.data.title + " row",
      //width: 600,
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Save"){
          // grab the form data
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId){
            var updateDoc = _.clone(AutoForm.getFormValues(formId).updateDoc);

            Meteor.call("updateDataStoreRow", row._id, updateDoc["$set"], function (error, response) {
              if(error){
                console.error("DataStoreRow insert update failed: ", error);
              } else {
                console.log("DataStoreRow insert update succeeded:", row._id);
              }
            });
            Dialog.hide();
          } else {
            console.error("Save failed: could not find form");
          }
        } else {
          Dialog.hide();
        }
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.data_store_data_table.rendered = function () {
  var self = this;

  // make sure the simple schema is up-to-date so that the forms works
  if(self.data.schema){
    DataStoreSchemas[self.data._id] = DSUtil.simpleSchema(self.data.schema);
  }
};

/**
 * Template Destroyed
 */
Template.data_store_data_table.destroyed = function () {

};

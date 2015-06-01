/**
 * Template Helpers
 */
Template.custom_field_types.helpers({
  customTypes: function () {
    return DataStores.find({
      projectVersionId: this.version._id,
      deleted: false,
      category: DataStoreCategories.userTypeCustom
    }, {sort: {title: 1}});
  }
});

/**
 * Template Helpers
 */
Template.custom_field_types.events({
  "click .btn-add-custom-type": function (event) {
    console.log("Add Custom Type");
    var instance = Template.instance();
    if(instance && instance.data && instance.data.project && instance.data.version){
      DataStores.insert({
        title: "New Type",
        dataKey: Util.dataKey(DataStoreCategories.userTypeCustom + " New Type"),
        category: DataStoreCategories.userTypeCustom,
        projectId: instance.data.project._id,
        projectVersionId: instance.data.version._id
      }, function (error, response) {
        if(error){
          console.error("Custom Type insert failed: ", error);
        } else {
          console.log("Custom Type inserted: ", response);
        }
      });
    }
  },
  "click .btn-delete-custom-type": function (event) {
    console.log("Delete Custom Type");
    var customType = $(event.target).attr("data-store-id");
    if(customType){
      DataStores.update({_id: customType}, {$set: {deleted: true}}, function (error, response) {
        if(error){
          console.error("Custom Type delete failed: ", error);
        } else {
          console.log("Custom Type deleted: ", response);
        }
      });
    }
  }
});

/**
 * Template Rendered
 */
Template.custom_field_types.rendered = function () {
  var instance = Template.instance();

  // Initialize the tabs
  Tabs.init(instance).activateFirst(instance);
  updateDataStoreNameEditable(instance);

  // Update the tabs if the list of custom types changes
  DataStores.find({projectVersionId: instance.data.version._id, deleted: false}).observeChanges({
    added: function () {
      Tabs.init(instance).activateFirst(instance);
      updateDataStoreNameEditable(instance);
    },
    changed: function () {  Tabs.init(instance).activateFirst(instance); },
    removed: function () {  Tabs.init(instance).activateFirst(instance); }
  });
};

/**
 * Template Destroyed
 */
Template.custom_field_types.destroyed = function () {

};

/**
 * Update the x-editable functionality for the tabs
 * @param instance
 */
var updateDataStoreNameEditable = function (instance) {
  // Initialize the x-editable functionality for the field titles
  instance.$('.data-store-name-editable').editable({
    mode: "inline",
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this,
        dataStoreId = $(editedElement).attr("data-pk");

      if(dataStoreId){
        DataStores.update({_id: dataStoreId}, {$set: {title: newValue}});
      }

      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
};
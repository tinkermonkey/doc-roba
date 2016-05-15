/**
 * Template Helpers
 */
Template.VersionCustomFieldTypes.helpers({
  customTypes: function () {
    return Collections.DataStores.find({
      projectVersionId: this._id,
      deleted: false,
      category: DataStoreCategories.userTypeCustom
    }, {sort: {title: 1}});
  }
});

/**
 * Template Helpers
 */
Template.VersionCustomFieldTypes.events({
  "click .btn-add-custom-type": function (event, instance) {
    Collections.DataStores.insert({
      title: "New Type",
      dataKey: Util.dataKey(DataStoreCategories.userTypeCustom + " New Type"),
      category: DataStoreCategories.userTypeCustom,
      projectId: instance.data.projectId,
      projectVersionId: instance.data._id
    }, function (error, response) {
      if(error){
        console.error("Custom Type insert failed: ", error);
      } else {
        console.log("Custom Type inserted: ", response);
      }
    });
  },
  "click .btn-delete-custom-type": function (event) {
    var customType = $(event.target).attr("data-store-id");
    if(customType){
      Collections.DataStores.update({_id: customType}, {$set: {deleted: true}}, function (error, response) {
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
Template.VersionCustomFieldTypes.rendered = function () {
  var instance = Template.instance();

  updateDataStoreNameEditable(instance);

  // Update the editables if the list of custom types changes
  Collections.DataStores.find({projectVersionId: instance.data.version._id, deleted: false}).observeChanges({
    added: function () {
      updateDataStoreNameEditable(instance);
    },
    changed: function () {  Tabs.init(instance).activateFirst(instance); },
    removed: function () {  Tabs.init(instance).activateFirst(instance); }
  });
};

/**
 * Template Destroyed
 */
Template.VersionCustomFieldTypes.destroyed = function () {

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
        Collections.DataStores.update({_id: dataStoreId}, {$set: {title: newValue}});
      }

      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
};
/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.helpers({
  userTypes: function () {
    if(this.version && this.version._id){
      return Collections.Nodes.find({projectVersionId: this.version._id, type: NodeTypes.userType}, {sort: {title: 1}});
    }
  },
  getDataStore: function () {
    return Collections.DataStores.findOne({dataKey: this._id});
  }
});

/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.events({
  "edited .render-row-selector": function (e, instance, newValue) {
    console.log("Data Store update: ", $(e.target).attr("data-key"));
    var dataStoreId = $(e.target).closest(".user-type-data-store").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;

    Collections.DataStores.update(dataStoreId, update, function (error) {
      if(error){
        Meteor.log.error("DataStore update failed: " + error.message);
        Dialog.error("DataStore update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.VersionUserTypesConfig.rendered = function () {
  var instance = Template.instance();

  // Initialize the tabs
  Tabs.init(instance).activateFirst(instance);
};

/**
 * Template Destroyed
 */
Template.VersionUserTypesConfig.destroyed = function () {

};

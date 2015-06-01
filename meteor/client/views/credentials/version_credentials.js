/**
 * Template Helpers
 */
Template.version_credentials.helpers({
  userTypes: function () {
    if(this.version && this.version._id){
      return Nodes.find({projectVersionId: this.version._id, type: NodeTypes.userType}, {sort: {title: 1}});
    }
  },
  getDataStore: function () {
    return DataStores.findOne({dataKey: this._id});
  }
});

/**
 * Template Helpers
 */
Template.version_credentials.events({});

/**
 * Template Rendered
 */
Template.version_credentials.rendered = function () {
  var instance = Template.instance();

  Tabs.init(instance).activateFirst(instance);
};

/**
 * Template Destroyed
 */
Template.version_credentials.destroyed = function () {

};

/**
 * Template Helpers
 */
Template.VersionCredentials.helpers({
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
Template.VersionCredentials.events({});

/**
 * Template Rendered
 */
Template.VersionCredentials.rendered = function () {
  var instance = Template.instance();

  Tabs.init(instance).activateFirst(instance);
};

/**
 * Template Destroyed
 */
Template.VersionCredentials.destroyed = function () {

};

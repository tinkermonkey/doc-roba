/**
 * Template Helpers
 */
Template.VersionCredentialsConfig.helpers({
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
Template.VersionCredentialsConfig.events({});

/**
 * Template Rendered
 */
Template.VersionCredentialsConfig.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.VersionCredentialsConfig.destroyed = function () {

};

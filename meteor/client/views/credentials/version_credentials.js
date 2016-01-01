/**
 * Template Helpers
 */
Template.VersionCredentials.helpers({
  userTypes: function () {
    return Collections.Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
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
 * Template Created
 */
Template.VersionCredentials.created = function () {

};

/**
 * Template Rendered
 */
Template.VersionCredentials.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.VersionCredentials.destroyed = function () {

};

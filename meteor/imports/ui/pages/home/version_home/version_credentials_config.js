/**
 * Template Helpers
 */
Template.VersionCredentialsConfig.helpers({
  getDataStore: function () {
    return Collections.DataStores.findOne({dataKey: this._id});
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

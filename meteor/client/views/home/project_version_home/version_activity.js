/**
 * Template Helpers
 */
Template.VersionActivity.helpers({
  hasChanges: function () {
    return Collections.RecordChanges.find({ projectVersionId: this._id }).count();
  },
  versionChanges: function () {
    return Collections.RecordChanges.find({ projectVersionId: this._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.VersionActivity.events({});

/**
 * Template Created
 */
Template.VersionActivity.created = function () {

};

/**
 * Template Rendered
 */
Template.VersionActivity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.VersionActivity.destroyed = function () {

};

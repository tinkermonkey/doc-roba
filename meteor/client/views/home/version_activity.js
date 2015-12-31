/**
 * Template Helpers
 */
Template.VersionActivity.helpers({
  hasChanges: function () {
    return Collections.RecordChanges.find({ projectId: this.project._id }).count();
  },
  versionChanges: function () {
    return Collections.RecordChanges.find({ projectVersionId: this.version._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.VersionActivity.events({});

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

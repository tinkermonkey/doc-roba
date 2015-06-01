/**
 * Template Helpers
 */
Template.version_activity.helpers({
  hasChanges: function () {
    return RecordChanges.find({ projectId: this.project._id }).count();
  },
  versionChanges: function () {
    return RecordChanges.find({ projectVersionId: this.version._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.version_activity.events({});

/**
 * Template Rendered
 */
Template.version_activity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.version_activity.destroyed = function () {

};

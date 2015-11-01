/**
 * Template Helpers
 */
Template.ProjectActivity.helpers({
  hasChanges: function () {
    return RecordChanges.find({ projectId: this.project._id }).count();
  },
  projectChanges: function () {
    return RecordChanges.find({ projectId: this.project._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.ProjectActivity.events({

});

/**
 * Template Rendered
 */
Template.ProjectActivity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ProjectActivity.destroyed = function () {

};

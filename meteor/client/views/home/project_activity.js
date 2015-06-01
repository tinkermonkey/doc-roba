/**
 * Template Helpers
 */
Template.project_activity.helpers({
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
Template.project_activity.events({

});

/**
 * Template Rendered
 */
Template.project_activity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.project_activity.destroyed = function () {

};

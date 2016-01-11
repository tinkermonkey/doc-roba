/**
 * Template Helpers
 */
Template.ProjectVersions.helpers({
  projectVersions: function () {
    return Collections.ProjectVersions.find({ projectId: this._id }, { sort: { version: -1 } });
  },
  project: function () {
    return Collections.Projects.findOne(this.projectId);
  }
});

/**
 * Template Helpers
 */
Template.ProjectVersions.events({
  "click .btn-add-version": function (event) {

  }
});

/**
 * Template Rendered
 */
Template.ProjectVersions.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ProjectVersions.destroyed = function () {

};

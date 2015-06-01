/**
 * Template Helpers
 */
Template.project_versions.helpers({
  projectVersions: function () {
    if(this.project){
      return ProjectVersions.find({ projectId: this.project._id }, { sort: { version: -1 } });
    }
  }
});

/**
 * Template Helpers
 */
Template.project_versions.events({
  "click .btn-add-version": function (event) {

  }
});

/**
 * Template Rendered
 */
Template.project_versions.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.project_versions.destroyed = function () {

};

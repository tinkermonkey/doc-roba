/**
 * Template Helpers
 */
Template.ProjectVersions.helpers({
  projectVersions: function () {
    if(this.project){
      return ProjectVersions.find({ projectId: this.project._id }, { sort: { version: -1 } });
    }
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

/**
 * Template Helpers
 */
Template.CurrentProjectHeader.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentProjectHeader.events({});

/**
 * Template Created
 */
Template.CurrentProjectHeader.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if(projectId){
      instance.project.set(Collections.Projects.findOne(projectId));
    }
    if(projectVersionId){
      instance.version.set(Collections.ProjectVersions.findOne(projectVersionId));
    }
  });

};

/**
 * Template Rendered
 */
Template.CurrentProjectHeader.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.CurrentProjectHeader.destroyed = function () {
  
};

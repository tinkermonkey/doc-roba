/**
 * Default email helpers
 */
EmailHelpers = {
  projectUrl: function (projectId) {
    console.log("projectId:", projectId);
    return Util.buildUrl(Meteor.absoluteUrl(), "projects", projectId)
  }
};
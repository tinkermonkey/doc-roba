/**
 * Methods and publications to enable test creation and execution
 */
Meteor.startup(function () {
  /**
   * Init
   */

  /**
   * Publications
   */
  Meteor.publish('test_groups', function (projectId, projectVersionId) {
    console.log("Publish: test_groups");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestGroups.find({projectVersionId: projectVersionId});
      }
    }
    console.log("TestGroups publication: returning nothing");
    return [];
  });
  Meteor.publish('test_cases', function (projectId, projectVersionId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCases.find({projectVersionId: projectVersionId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
  });
});

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
  Meteor.publish('test_case_roles', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCaseRoles.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });
  Meteor.publish('test_case_steps', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCaseSteps.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
    deleteTestCaseRole: function (role) {
      check(role, Object);
      check(role.projectId, String);
      check(role.projectVersionId, String);
      check(role.testCaseId, String);
      check(role._id, String);

      Meteor.log.debug("deleteTestCaseRole: " + role._id);

      // Delete the steps for this role
      TestCaseSteps.remove({ testCaseRoleId: role._id });

      // Delete the role
      TestCaseRoles.remove({_id: role._id});
    }
  });
});

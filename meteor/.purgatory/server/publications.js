/**
 * Publications
 */
Meteor.startup(function () {

  // All active project

  /**
   * ============================================================================
   * Version information: user_types, etc
   * ============================================================================
   */

  /**
   * ============================================================================
   * Infrastructure information: servers, test systems, etc
   * ============================================================================
   */
  Meteor.publish("servers", function (projectId, projectVersionId) {
    console.debug("Publish: servers");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Servers.find({projectVersionId: projectVersionId});
    }
    return [];
  });
  Meteor.publish("server", function (projectId, projectVersionId, serverId) {
    console.debug("Publish: server");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Servers.find({projectVersionId: projectVersionId, staticId: serverId});
    }
    return [];
  });
  Meteor.publish("test_systems", function (projectId, projectVersionId) {
    console.debug("Publish: test_systems");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.TestSystems.find({projectVersionId: projectVersionId});
    }
    return [];
  });
  Meteor.publish("test_system", function (projectId, projectVersionId, testSystemId) {
    console.debug("Publish: test_system");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.TestSystems.find({projectVersionId: projectVersionId, staticId: testSystemId});
    }
    return [];
  });
  Meteor.publish("test_agents", function (projectId, projectVersionId) {
    console.debug("Publish: test_agents");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.TestAgents.find({projectVersionId: projectVersionId});
    }
    return [];
  });
  Meteor.publish("test_agent", function (projectId, projectVersionId, testAgentId) {
    console.debug("Publish: test_agent");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.TestAgents.find({projectVersionId: projectVersionId, staticId: testAgentId});
    }
    return [];
  });
});

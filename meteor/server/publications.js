/**
 * Publications
 */
Meteor.startup(function () {
  /**
   * ============================================================================
   * User data
   * ============================================================================
   */
  Meteor.publish("user_data", function () {
    console.debug("Publish: user_data");
    if(this.userId) {
      return Meteor.users.find({_id: this.userId},
        {fields: {projectList: 1, projects: 1, isSystemAdmin: 1}});
    } else {
      this.ready();
      return [];
    }
  });
  Meteor.publish("user_peers", function (projectList) {
    console.debug("Publish: user_peers");
    var user = Meteor.users.findOne(this.userId);
    if(user && user.projectList && user.projectList.length) {
      console.log("user_peers:", user.projectList);
      return Meteor.users.find({projectList: user.projectList}, {
        fields: {
          profile: 1,
          emails: 1,
          projectList: 1,
          projects: 1
        }
      });
    } else {
      console.log("user_peers fail:", user);
    }
    return []
  });

  /**
   * ============================================================================
   * Doc Tree Data: Nodes, Actions, etc
   * ============================================================================
   */
  Meteor.publish("nodes", function (projectId, projectVersionId) {
    console.debug("Publish: nodes");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Nodes.find({projectVersionId: projectVersionId});
    }
    console.warn("Publish: nodes returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
    return [];
  });
  Meteor.publish("actions", function (projectId, projectVersionId) {
    console.debug("Publish: actions");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Actions.find({projectVersionId: projectVersionId});
    }
    console.warn("Publish: actions returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
    return [];
  });

  /**
   * ============================================================================
   * Automation and Test Definition
   * ============================================================================
   */
  Meteor.publish("driver_commands", function () {
    console.debug("Publish: driver_commands");
    return Collections.DriverCommands.find();
  });

  /**
   * ============================================================================
   * Basic User data-set: projects, versions, roles, changes
   * ============================================================================
   */

  // All active project
  Meteor.publish("projects", function (projectList) {
    console.debug("Publish: projects");
    if(this.userId){
      var user = Meteor.users.findOne(this.userId);
      return Collections.Projects.find({_id: {$in: user.projectList || [] }, active: true});
    }
    console.warn("Publish: projects returning nothing");
    return [];
  });
  Meteor.publish("project_versions", function (projectList) {
    console.debug("Publish: project_versions");
    if(this.userId){
      var user = Meteor.users.findOne(this.userId);
      return Collections.ProjectVersions.find({projectId: {$in: user.projectList || [] }, active: true});
    }
    console.warn("Publish: project_versions returning nothing");
    return [];
  });
  Meteor.publish("changes", function (projectList, limit) {
    console.debug("Publish: changes");
    if(this.userId){
      var user = Meteor.users.findOne(this.userId),
        limit = limit || 25;
      return Collections.RecordChanges.find({projectId: {$in: user.projectList || []}}, {limit: limit});
    }
    console.warn("Publish: changes returning nothing");
    return [];
  });

  // All projects the user has a role for
  Meteor.publish("all_projects", function (projectList) {
    console.debug("Publish: all_projects");
    if(this.userId){
      var user = Meteor.users.findOne(this.userId);
      return Collections.Projects.find({_id: {$in: user.projectList || [] }});
    }
    console.warn("Publish: all_projects returning nothing");
    return [];
  });

  // Invitations to join other projects
  Meteor.publish("user_invitations", function () {
    console.debug("Publish: user_invitations");
    if(this.userId){
      var user = Meteor.users.findOne(this.userId);
      return Collections.ProjectInvitations.find({inviteeEmail: {$in: _.map(user.emails, function (email) {return email.address}) }});
    }
    console.warn("Publish: user_invitations returning nothing");
    return [];
  });

  // Invitations sent for a project
  Meteor.publish("invitations_sent", function (projectId) {
    console.debug("Publish: invitations_sent");
    if(Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.ProjectInvitations.find({projectId: projectId});
    }
    console.warn("Publish: user_invitations returning nothing");
    return [];
  });

  /**
   * ============================================================================
   * Version information: user_types, etc
   * ============================================================================
   */
  Meteor.publish("user_types", function (projectId, projectVersionId) {
    console.debug("Publish: user_types");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.userType});
    }
    return [];
  });
  Meteor.publish("platforms", function (projectId, projectVersionId) {
    console.debug("Publish: platforms");
    // check that there is a project role for the current user
    if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
      return Collections.Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.platform});
    }
    return [];
  });

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

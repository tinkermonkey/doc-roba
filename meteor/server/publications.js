/**
 * Publications
 */
Meteor.startup(function () {
  /**
   * ============================================================================
   * Doc Tree Feeders: Nodes, Actions, etc
   * ============================================================================
   */
  Meteor.publish('nodes', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Nodes.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('actions', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Actions.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  /**
   * ============================================================================
   * Automation and Test Definition
   * ============================================================================
   */
  Meteor.publish('driver_commands', function () {
    return Collections.DriverCommands.find();
  });

  /**
   * ============================================================================
   * Basic User data-set: projects, versions, roles, changes
   * ============================================================================
   */
  Meteor.publish('projects', function () {
    if(this.userId){
      var projectIds = [];
      Collections.ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return Collections.Projects.find({_id: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('project_roles', function () {
    if(this.userId){
      //return ProjectRoles.find({userId: this.userId});
      var projectIds = [];
      Collections.ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return Collections.ProjectRoles.find({projectId: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('project_versions', function () {
    if(this.userId){
      var projectIds = [];
      Collections.ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return Collections.ProjectVersions.find({projectId: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('changes', function (limit) {
    if(this.userId){
      var projectIds = [],
        limit = limit || 25;
      Collections.ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return RecordChanges.find({projectId: {$in: projectIds}}, {limit: limit});
    }
    return [];
  });

  /**
   * ============================================================================
   * Version information: user_types, etc
   * ============================================================================
   */
  Meteor.publish('user_types', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.userType});
      }
    }
    return [];
  });
  Meteor.publish('platforms', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.platform});
      }
    }
    return [];
  });

  /**
   * ============================================================================
   * Infrastructure information: servers, test systems, etc
   * ============================================================================
   */
  Meteor.publish('servers', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Servers.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('server', function (projectId, projectVersionId, serverId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Servers.find({projectVersionId: projectVersionId, staticId: serverId});
      }
    }
    return [];
  });
  Meteor.publish('test_systems', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestSystems.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_system', function (projectId, projectVersionId, testSystemId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestSystems.find({projectVersionId: projectVersionId, staticId: testSystemId});
      }
    }
    return [];
  });
  Meteor.publish('test_agents', function (projectId, projectVersionId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestAgents.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_agent', function (projectId, projectVersionId, testAgentId) {
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestAgents.find({projectVersionId: projectVersionId, staticId: testAgentId});
      }
    }
    return [];
  });
});

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
    //console.log("Publish: nodes");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Nodes.find({projectVersionId: projectVersionId});
      }
    }
    console.log("Nodes publication: returning nothing");
    return [];
  });
  Meteor.publish('actions', function (projectId, projectVersionId) {
    //console.log("Publish: actions");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Actions.find({projectVersionId: projectVersionId});
      }
    }
    console.log("Actions publication: returning nothing");
    return [];
  });
  /**
   * ============================================================================
   * Automation and Test Definition
   * ============================================================================
   */
  Meteor.publish('driver_commands', function () {
    //console.log("Publish: driver_commands");
    return DriverCommands.find();
  });

  /**
   * ============================================================================
   * Basic User data-set: projects, versions, roles, changes
   * ============================================================================
   */
  Meteor.publish('projects', function () {
    //console.log("Publish: projects");
    if(this.userId){
      var projectIds = [];
      ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return Projects.find({_id: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('project_roles', function () {
    //console.log("Publish: project_roles");
    if(this.userId){
      //return ProjectRoles.find({userId: this.userId});
      var projectIds = [];
      ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return ProjectRoles.find({projectId: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('project_versions', function () {
    //console.log("Publish: project_versions");
    if(this.userId){
      var projectIds = [];
      ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return ProjectVersions.find({projectId: {$in: projectIds }});
    }
    return [];
  });
  Meteor.publish('changes', function () {
    //console.log("Publish: changes");
    if(this.userId){
      var projectIds = [];
      ProjectRoles.find({userId: this.userId}).forEach(function (role) {
        projectIds.push(role.projectId);
      });
      return RecordChanges.find({projectId: {$in: projectIds}}, {limit: 100});
    }
    return [];
  });

  /**
   * ============================================================================
   * Version information: user_types, etc
   * ============================================================================
   */
  Meteor.publish('user_types', function (projectId, projectVersionId) {
    //console.log("Publish: user_types");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.userType});
      }
    }
    console.log("UserTypes publication: returning nothing");
    return [];
  });

  /**
   * ============================================================================
   * Infrastructure information: servers, test systems, etc
   * ============================================================================
   */
  Meteor.publish('servers', function (projectId, projectVersionId) {
    //console.log("Publish: servers");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Servers.find({projectVersionId: projectVersionId});
      }
    }
    console.log("Servers publication: returning nothing");
    return [];
  });
  Meteor.publish('test_systems', function (projectId, projectVersionId) {
    //console.log("Publish: test_systems");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestSystems.find({projectVersionId: projectVersionId});
      }
    }
    console.log("Test Systems publication: returning nothing");
    return [];
  });
  Meteor.publish('test_agents', function (projectId, projectVersionId) {
    //console.log("Publish: test_agents");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestAgents.find({projectVersionId: projectVersionId});
      }
    }
    console.log("Test Agents publication: returning nothing");
    return [];
  });
});

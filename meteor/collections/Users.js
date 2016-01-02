// Quick alias for normalizing the users collection
Collections.Users = Meteor.users;

/**
 * Helpers for the project permissions
 */
Collections.Users.helpers({
  /**
   * Returns true if a user has read access to a project
   * @param id Project of ProjectVersion _id
   * @returns {boolean}
   */
  hasProjectAccess: function (id) {
    var user = this;
    // check projectList first
    if(_.contains(user.projectList, id)){
      return true;
    } else {
      return Collections.ProjectVersions.find({projectId: {$in: user.projectList}, _id: id}).count() > 0;
    }
  },

  /**
   * Return the list of roles for a project
   * @param projectId
   */
  projectRoles: function(projectId) {
    var user = this;
    if(user.projectList && _.contains(user.projectList, projectId)){
      return user.projects[projectId].roles;
    }
    return [];
  },

  /**
   * Returns true if a user has admin privileges for a project
   * @param projectId
   * @returns {boolean}
   */
  hasAdminAccess: function (projectId) {
    var user = this;
    if(user.projectList && _.contains(user.projectList, projectId)
      && user.projects && user.projects[projectId] && user.projects[projectId].roles){
      return _.contains(user.projects[projectId].roles, RoleTypes.admin)
        || _.contains(user.projects[projectId].roles, RoleTypes.owner)
        || user.isSystemAdmin;
    }
    return user.isSystemAdmin;
  },

  /**
   * Returns true if a user has developer privileges
   * @param projectId
   * @returns {boolean}
   */
  hasDeveloperAccess: function (projectId) {
    var user = this;
    if(user.projectList && _.contains(user.projectList, projectId)
      && user.projects && user.projects[projectId] && user.projects[projectId].roles){
      return _.contains(user.projects[projectId].roles, RoleTypes.admin)
        || _.contains(user.projects[projectId].roles, RoleTypes.owner)
        || _.contains(user.projects[projectId].roles, RoleTypes.developer)
        || user.isSystemAdmin;
    }
    return user.isSystemAdmin;
  },

  /**
   * Returns true if a user has test privileges
   * @param projectId
   * @returns {boolean}
   */
  hasTesterAccess: function (projectId) {
    var user = this;
    if(user.projectList && _.contains(user.projectList, projectId)
      && user.projects && user.projects[projectId] && user.projects[projectId].roles){
      return _.contains(user.projects[projectId].roles, RoleTypes.admin)
        || _.contains(user.projects[projectId].roles, RoleTypes.owner)
        || _.contains(user.projects[projectId].roles, RoleTypes.developer)
        || _.contains(user.projects[projectId].roles, RoleTypes.tester)
        || user.isSystemAdmin;
    }
    return user.isSystemAdmin;
  },

  /**
   * Returns true if a user has the specified role for the specified project
   * @param projectId
   * @param role
   * @returns {boolean}
   */
  hasProjectRole: function (projectId, role) {
    var user = this;
    if(user.projectList && _.contains(user.projectList, projectId)
      && user.projects && user.projects[projectId] && user.projects[projectId].roles){
      return _.contains(user.projects[projectId].roles, role)
        || user.isSystemAdmin;
    }
    return user.isSystemAdmin;
  },

  /**
   * Add a role for a project to the user
   * @param projectId
   * @param role
   */
  addProjectRole: function (projectId, role) {
    var user = this,
      projects = user.projects || {},
      projectList = user.projectList || [],
      actor = Meteor.user();

    // make sure the actor has project admin privileges
    if(actor.hasProjectRole(projectId, RoleTypes.admin)){
      projectList.push(projectId);
      if(projects[projectId] && projects[projectId].roles){
        projects[projectId].roles.push(role);
      } else {
        projects[projectId] = projects[projectId] || {};
        projects[projectId].roles = [role];
      }
      projectList = _.uniq(projectList);
      projects[projectId].roles = _.uniq(projects[projectId].roles);
      Collections.Users.update(user._id, {$set: {projectList: projectList, projects: projects}});
    } else {
      Meteor.log.error("Users.addProjectRole failed: user [" + actor.username + "] does not have project admin privileges");
    }
  }
});
import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {ProjectRoles} from '../project/project_roles.js';
import {ProjectVersions} from '../project/project_version.js';

// Quick alias for normalizing the users collection
export const Users = Meteor.users;
Users.deny(Auth.ruleSets.deny.always);

/**
 * Helpers for the project permissions
 */
Users.helpers({
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
      return ProjectVersions.find({projectId: {$in: user.projectList}, _id: id}).count() > 0;
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
      return _.contains(user.projects[projectId].roles, ProjectRoles.admin)
        || _.contains(user.projects[projectId].roles, ProjectRoles.owner)
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
      return _.contains(user.projects[projectId].roles, ProjectRoles.admin)
        || _.contains(user.projects[projectId].roles, ProjectRoles.owner)
        || _.contains(user.projects[projectId].roles, ProjectRoles.developer)
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
      return _.contains(user.projects[projectId].roles, ProjectRoles.admin)
        || _.contains(user.projects[projectId].roles, ProjectRoles.owner)
        || _.contains(user.projects[projectId].roles, ProjectRoles.developer)
        || _.contains(user.projects[projectId].roles, ProjectRoles.tester)
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
    if(actor.hasAdminAccess(projectId)){
      projectList.push(projectId);
      if(projects[projectId] && projects[projectId].roles){
        projects[projectId].roles.push(role);
      } else {
        projects[projectId] = projects[projectId] || {};
        projects[projectId].roles = [role];
      }
      projectList = _.uniq(projectList);
      projects[projectId].roles = _.uniq(projects[projectId].roles);
      Users.update(user._id, {$set: {projectList: projectList, projects: projects}});
    } else {
      console.error("Users.addProjectRole failed: user [" + actor.username + "] does not have project admin privileges");
    }
  },

  /**
   * Set the role for a project for the user
   * @param projectId
   * @param role
   */
  setProjectRole: function (projectId, role) {
    var user = this,
      projects = user.projects || {},
      projectList = user.projectList || [],
      actor = Meteor.user();

    // make sure the actor has project admin privileges
    if(actor.hasAdminAccess(projectId)){
      projectList.push(projectId);
      if(!projects[projectId] || !projects[projectId].roles){
        projects[projectId] = projects[projectId] || {};
      }
      projects[projectId].roles = [role];
      projectList = _.uniq(projectList);
      Users.update(user._id, {$set: {projectList: projectList, projects: projects}});
    } else {
      console.error("Users.addProjectRole failed: user [" + actor.username + "] does not have project admin privileges");
    }
  },

  /**
   * Remove a project role from a user
   * @param projectId
   * @param role
   */
  removeProjectRole: function (projectId, role) {
    var user = this,
        projects = user.projects || {},
        projectList = user.projectList || [],
        actor = Meteor.user();

    // make sure the actor has project admin privileges
    if(actor.hasAdminAccess(projectId)){
      if(projects[projectId] && projects[projectId].roles && _.contains(projects[projectId].roles, role)){
        if(projects[projectId].roles.length == 1){
          // If the user only has a single role, remove their access to the project
          projectList = _.without(projectList, projectId);
          delete projects[projectId];
        } else {
          // Otherwise, just remove the role
          projects[projectId].roles = _.without(projects[projectId].roles, role);
        }
        Users.update(user._id, {$set: {projectList: projectList, projects: projects}});
      }
    } else {
      console.error("Users.removeProjectRole failed: user [" + actor.username + "] does not have project admin privileges");
    }
  },

  /**
   * Remove a user's access to a project
   * @param projectId
   */
  removeProjectAccess: function (projectId) {
    var user = this,
        projects = user.projects || {},
        projectList = user.projectList || [],
        actor = Meteor.user();

    // make sure the actor has project admin privileges
    if(actor.hasAdminAccess(projectId)){
      if(projects[projectId] || _.contains(projectList, projectId)){
        projectList = _.without(projectList, projectId);
        delete projects[projectId];
        Users.update(user._id, {$set: {projectList: projectList, projects: projects}});
      }
    } else {
      console.error("Users.removeProjectAccess failed: user [" + actor.username + "] does not have project admin privileges");
    }
  }
});

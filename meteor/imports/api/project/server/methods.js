import {Meteor} from 'meteor/meteor';
import {Mailer} from 'meteor/lookback:emails';
import {Auth} from '../../auth.js';
import {Projects} from '../project.js';
import {ProjectRoles, ProjectRolesLookup} from '../project_roles.js';
import {ProjectVersions} from '../project_version.js';
import {ProjectInvitations} from '../project_invitations.js';

import {Actions} from '../../action/action.js';
import {Nodes} from '../../node/node.js';

Meteor.methods({
  /**
   * Create a new project
   * @param title
   * @param initialVersion
   */
  createProject(title, initialVersion) {
    console.debug("createProject:", title, initialVersion);
    var user = Auth.requireAuthentication();
    
    if(user && title && initialVersion){
      if(user.isSystemAdmin || Meteor.settings.allowPersonalProjects){
        console.info("createProject: ", title, "for user", user._id);
        
        // Create the project
        var projectId = Projects.insert({
          owner: user._id,
          title: title
        });
        
        // Add the project to the user's record
        user.addProjectRole(projectId, ProjectRoles.owner);
        
        // Create the project version
        var projectVersionId = ProjectVersions.insert({
          projectId: projectId,
          version: initialVersion
        });
        
        // Create the root node
        var rootNodeId = Nodes.insert({
          projectId: projectId,
          projectVersionId: projectVersionId,
          title: title,
          type: NodeTypes.root
        });
        
        return projectId;
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("createProject failed: either title or version missing");
    }
  },
  
  /**
   * Delete a project
   * This actually deletes the data, for real, permanently aside from your backups
   * @param projectId
   */
  deleteProject(projectId) {
    console.debug("deleteProject:", projectId);
    var user = Auth.requireAuthentication();
    
    if(user && projectId){
      if(user.isSystemAdmin || user.hasAdminAccess(projectId)){
        console.info("deleteProject: authorized by user", user._id, ", performing delete");
        
        // First remove everyone's access to the project
        Meteor.users.find({projectList: projectId, _id: {$ne: user._id}}).forEach((projectUser) => {
          console.debug("Removing project " + projectId + " access for " + projectUser._id);
          projectUser.removeProjectAccess(projectId);
        });
        
        // Remove all of the records pertaining to this project
        _.without(_.keys(Collections), "Users", "Projects").forEach((collectionKey) => {
          console.info("Removing records for project " + projectId + " from " + collectionKey);
          Collections[collectionKey].remove({projectId: projectId});
        });
        
        // Remove the project record
        Projects.remove(projectId);
        
        // Remove the current user's access to the project
        user.removeProjectAccess(projectId);
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("deleteProject failed: no project specified");
    }
  },
  
  /**
   * Invite a user to a project
   * @param userEmail The email address to send the invitation to
   * @param userName The name of the person being invited
   * @param projectId The id of the project the person is being invited to
   */
  inviteUser(userEmail, userName, role, projectId) {
    console.debug("inviteUser:", userEmail, userName, role, projectId);
    var user = Auth.requireAuthentication();
    
    if(user && userEmail && userName && role && projectId){
      if(user.isSystemAdmin || user.hasAdminAccess(projectId)) {
        // get the project record
        var project = Projects.findOne(projectId);
        if(!project){
          throw new Meteor.Error("inviteUser failed: project not found");
        }
        
        // Create the invitation record
        var invitationId = ProjectInvitations.insert({
          projectId: projectId,
          projectTitle: project.title,
          invitorId: user._id,
          invitorName: user.profile.name,
          projectRole: role,
          inviteeEmail: userEmail,
          inviteeName: userName
        });
        var invitation = ProjectInvitations.findOne(invitationId);
        
        // Send the invitation email
        console.debug("inviteUser to project [", invitation.projectId, "] to ", invitation.inviteeName + " <" + invitation.inviteeEmail + ">");
        Mailer.send({
          to: userName + "<" + userEmail + ">",
          subject: "Invitation to join " + project.title + " on DocRoba",
          template: "ProjectInvitation",
          data: {
            project: project,
            invitation: invitation
          }
        });
        
        // Mark the invitation sent
        ProjectInvitations.update(invitationId, {$set: {invitationSent: true}});
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("inviteUser failed: missing required information");
    }
  },
  
  /**
   * Resend an invitation
   * @param invitationId
   */
  resendInvitation(invitationId) {
    console.debug("resendInvitation:", invitationId);
    var user = Auth.requireAuthentication(),
        invitation = ProjectInvitations.findOne(invitationId);
    
    if(invitation) {
      if (user.hasAdminAccess(invitation.projectId)) {
        // get the project record
        var project = Projects.findOne(invitation.projectId);
        if (!project) {
          throw new Meteor.Error("resendInvitation failed: project not found");
        }
        
        // Send the invitation email
        console.debug("resendInvitation to project [", invitation.projectId, "] to ", invitation.inviteeName + " <" + invitation.inviteeEmail + ">");
        Mailer.send({
          to: invitation.inviteeName + " <" + invitation.inviteeEmail + ">",
          subject: "Invitation to join " + project.title + " on DocRoba",
          template: "ProjectInvitation",
          data: {
            project: project,
            invitation: invitation
          }
        });
        
        // Mark the invitation sent
        ProjectInvitations.update(invitationId, {$set: {invitationSent: true}});
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("resendInvitation failed: invitation not found");
    }
  },
  
  /**
   * Accept an invitation
   * @param invitationId
   */
  acceptInvitation(invitationId) {
    console.debug("acceptInvitation:", invitationId);
    var user = Auth.requireAuthentication(),
        invitation = ProjectInvitations.findOne(invitationId),
        userEmails = _.map(user.emails, (email) => { return email.address});
    
    if(invitation) {
      if(_.contains(userEmails, invitation.inviteeEmail)) {
        console.debug("acceptInvitation to project [", invitation.projectId, "] to ", invitation.inviteeName + " <" + invitation.inviteeEmail + ">");
        
        // Add this project and role the users's projectList and project roles
        var projects = user.projects || {},
            projectList = user.projectList || [];
        
        projectList.push(invitation.projectId);
        if(projects[invitation.projectId] && projects[invitation.projectId].roles){
          projects[invitation.projectId].roles.push(invitation.projectRole);
        } else {
          projects[invitation.projectId] = projects[invitation.projectId] || {};
          projects[invitation.projectId].roles = [invitation.projectRole];
        }
        projectList = _.uniq(projectList);
        projects[invitation.projectId].roles = _.uniq(projects[invitation.projectId].roles);
        
        // Update the user record
        Meteor.users.update(user._id, {$set: {projectList: projectList, projects: projects}});
        
        // remove the invite
        ProjectInvitations.remove(invitationId);
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("acceptInvitation failed: invitation not found");
    }
  },
  
  /**
   * Delete an invitation
   * @param invitationId
   */
  deleteInvitation(invitationId) {
    console.debug("deleteInvitation:", invitationId);
    var user = Auth.requireAuthentication(),
        invitation = ProjectInvitations.findOne(invitationId),
        userEmails = _.map(user.emails, (email) => { return email.address});
    
    if(invitation) {
      if(_.contains(userEmails, invitation.inviteeEmail)) {
        console.debug("deleteInvitation to project [", invitation.projectId, "] to ", invitation.inviteeName + " <" + invitation.inviteeEmail + ">");
        ProjectInvitations.remove(invitationId);
      } else {
        throw new Meteor.Error(403);
      }
    } else {
      throw new Meteor.Error("deleteInvitation failed: invitation not found");
    }
  },
  
  /**
   * Add a project role to a user
   */
  addProjectRole(userId, projectId, role) {
    console.debug("addProjectRole:", userId, projectId, role);
    var actor = Auth.requireAuthentication(),
        user = Meteor.users.findOne(userId);
    
    if(actor.isSystemAdmin || actor.hasAdminAccess(projectId)) {
      user.addProjectRole(projectId, role);
    } else {
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a project role from a user
   */
  removeProjectRole(userId, projectId, role) {
    console.debug("removeProjectRole:", userId, projectId, role);
    var actor = Auth.requireAuthentication(),
        user = Meteor.users.findOne(userId);
    
    if(actor.isSystemAdmin || actor.hasAdminAccess(projectId)) {
      if(user.hasProjectRole(projectId, role)) {
        user.removeProjectRole(projectId, role);
      } else {
        throw new Meteor.Error("removeProjectRole failed: user doesn't have the role");
      }
    } else {
      throw new Meteor.Error(403);
    }
  },
    
  /**
   * Give a user a role for a project
   * @param projectId
   * @param userId
   * @param role
   */
  grantProjectRole(projectId, userId, role) {
    console.debug("grantProjectRole: " + projectId + ", " + userId + ", " + role);
    var user = Meteor.users.findOne(userId);
    if(user && ProjectRolesLookup[role]){
      user.addProjectRole(projectId, role);
    }
  },
  /**
   * Remove project access from a user
   */
  removeProjectAccess(userId, projectId) {
    console.debug("removeProjectAccess:", userId, projectId);
    var actor = Auth.requireAuthentication(),
        user = Meteor.users.findOne(userId);
    
    if(actor.isSystemAdmin || actor.hasAdminAccess(projectId)) {
      if(user.hasProjectAccess(projectId)) {
        user.removeProjectAccess(projectId);
      } else {
        throw new Meteor.Error("removeProjectAccess failed: user doesn't have project access");
      }
    } else {
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Create a new version, replicating all data from a version
   * @param sourceVersionId
   * @param versionString
   */
  createVersion(sourceVersionId, versionString) {
    console.debug("createVersion:", sourceVersionId, versionString);
    // Require authentication
    if(!this.userId){
      throw new Meteor.Error("createVersion: not authenticated");
    }
    var user = Meteor.users.findOne(this.userId);
    
    // require a full set of source material
    check(sourceVersionId, String);
    check(versionString, String);
    
    // Validate all of the Ids by pulling in the records
    var sourceVersion = ProjectVersions.findOne(sourceVersionId),
        project = Projects.findOne(sourceVersion.projectId);
    if(sourceVersion && project){
      if(!user.hasAdminAccess(sourceVersion.projectId)){
        throw new Meteor.Error("createVersion: user not authorized");
      }
      
      // Create the new version record
      var versionId = ProjectVersions.insert({
        projectId: sourceVersion.projectId,
        version: versionString,
        createdBy: userId,
        modifiedBy: userId
      });
      
      if(!versionId){
        throw new Meteor.Error("createVersion: failed to create new version record");
      }
      
      /**
       * Helper for creating replica records
       */
      var createReplica = function (record) {
        // Leave dateCreated and createdBy intact to preserve documentation history
        return _.omit(record, ["_id", "modifiedBy", "dateModified", "projectVersionId"]);
      };
      
      // Replicate all of the important records from the source version
      var replicateCollections = [Nodes, Actions];
      _.each(replicateCollections, (collection) => {
        collection.find({ projectVersionId: sourceVersion._id }).forEach((record) => {
          var replica = createReplica(record);
          replica.projectVersionId = versionId;
          replica.modifiedBy = userId;
          try {
            collection.insert(replica);
          } catch (e) {
            console.error("createVersion insert failed: " + e.toString());
          }
        });
      });
      
      // done!
      return versionId;
    } else {
      throw new Meteor.Error("createVersion: unable to create version from information provided");
    }
  },
  
  /**
   * Create a code module for a project version
   * @param projectId
   * @param projectVersionId
   * @return CodeModule._id
   */
  createVersionCodeModule(projectId, projectVersionId, type){
    console.debug("createVersionCodeModule:", projectId, projectVersionId, type);
    check(projectId, String);
    check(projectVersionId, String);
    check(type, Number);
    
    let user = Auth.requireProjectAccess(projectId),
        projectVersion = ProjectVersions.findOne({_id: projectVersionId});
    return projectVersion.codeModule(type);
  },
  
  /**
   * Create a datastore for project version server config data
   * @param projectId
   * @param projectVersionId
   * @return CodeModule._id
   */
  createVersionServerConfigDatastore(projectId, projectVersionId){
    console.debug("createVersionServerConfigDatastore:", projectId, projectVersionId);
    check(projectId, String);
    check(projectVersionId, String);
    
    let user = Auth.requireProjectAccess(projectId),
        projectVersion = ProjectVersions.findOne({_id: projectVersionId});
    return projectVersion.serverConfigDatastore();
  }
});

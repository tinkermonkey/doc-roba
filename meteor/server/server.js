/**
 * Core methods
 */
Meteor.startup(function () {
  Meteor.methods({
    echo: function () {
      var user = Auth.requireAuthentication();

      console.debug("Echo called by user " + user._id);
      return { user: user._id, argv: arguments };
    },

    /**
     * Create a new project
     * @param title
     */
    createProject: function (title) {
      console.debug("createProject:", title);
      var user = Auth.requireAuthentication();

      if(user && title){
        if(user.isSystemAdmin || Meteor.settings.allowPersonalProjects){
          console.info("createProject: ", title, "for user", user._id);

          // Create the project
          var projectId = Collections.Projects.insert({
            owner: user._id,
            title: title
          });

          // Add the project to the user's record
          user.addProjectRole(projectId, RoleTypes.owner);
          return projectId;
        } else {
          throw new Meteor.Error(403);
        }
      } else {
        throw new Meteor.Error("createProject failed: no title specified");
      }
    },

    /**
     * Delete a project
     * This actually deletes the data, for real, permanently aside from your backups
     * @param projectId
     */
    deleteProject: function (projectId) {
      console.debug("deleteProject:", projectId);
      var user = Auth.requireAuthentication();

      if(user && projectId){
        if(user.isSystemAdmin || user.hasAdminAccess(projectId)){
          console.info("deleteProject: authorized by user", user._id, ", performing delete");

          // First remove everyone's access to the project
          Collections.Users.find({projectList: projectId, _id: {$ne: user._id}}).forEach(function (projectUser) {
            console.debug("Removing project " + projectId + " access for " + projectUser._id);
            projectUser.removeProjectAccess(projectId);
          });

          // Remove all of the records pertaining to this project
          _.without(_.keys(Collections), "Users", "Projects").forEach(function (collectionKey) {
            console.info("Removing records for project " + projectId + " from " + collectionKey);
            Collections[collectionKey].remove({projectId: projectId});
          });

          // Remove the project record
          Collections.Projects.remove(projectId);

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
    inviteUser: function (userEmail, userName, role, projectId) {
      console.debug("inviteUser:", userEmail, userName, role, projectId);
      var user = Auth.requireAuthentication();

      if(user && userEmail && userName && role && projectId){
        if(user.isSystemAdmin || user.hasAdminAccess(projectId)) {
          // get the project record
          var project = Collections.Projects.findOne(projectId);
          if(!project){
            throw new Meteor.Error("inviteUser failed: project not found");
          }

          // Create the invitation record
          var invitationId = Collections.ProjectInvitations.insert({
            projectId: projectId,
            projectTitle: project.title,
            invitorId: user._id,
            invitorName: user.profile.name,
            projectRole: role,
            inviteeEmail: userEmail,
            inviteeName: userName
          });
          var invitation = Collections.ProjectInvitations.findOne(invitationId);

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
          Collections.ProjectInvitations.update(invitationId, {$set: {invitationSent: true}});
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
    resendInvitation: function (invitationId) {
      console.debug("resendInvitation:", invitationId);
      var user = Auth.requireAuthentication(),
          invitation = Collections.ProjectInvitations.findOne(invitationId);

      if(invitation) {
        if (user.hasAdminAccess(invitation.projectId)) {
          // get the project record
          var project = Collections.Projects.findOne(invitation.projectId);
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
          Collections.ProjectInvitations.update(invitationId, {$set: {invitationSent: true}});
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
    acceptInvitation: function (invitationId) {
      console.debug("acceptInvitation:", invitationId);
      var user = Auth.requireAuthentication(),
          invitation = Collections.ProjectInvitations.findOne(invitationId),
          userEmails = _.map(user.emails, function (email) { return email.address});

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
          Collections.Users.update(user._id, {$set: {projectList: projectList, projects: projects}});

          // remove the invite
          Collections.ProjectInvitations.remove(invitationId);
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
    deleteInvitation: function (invitationId) {
      console.debug("deleteInvitation:", invitationId);
      var user = Auth.requireAuthentication(),
          invitation = Collections.ProjectInvitations.findOne(invitationId),
          userEmails = _.map(user.emails, function (email) { return email.address});

      if(invitation) {
        if(_.contains(userEmails, invitation.inviteeEmail)) {
          console.debug("deleteInvitation to project [", invitation.projectId, "] to ", invitation.inviteeName + " <" + invitation.inviteeEmail + ">");
          Collections.ProjectInvitations.remove(invitationId);
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
    addProjectRole: function (userId, projectId, role) {
      console.debug("addProjectRole:", userId, projectId, role);
      var actor = Auth.requireAuthentication(),
          user = Collections.Users.findOne(userId);

      if(actor.isSystemAdmin || actor.hasAdminAccess(projectId)) {
        if(!user.hasProjectRole(projectId, role)) {
          user.addProjectRole(projectId, role);
        } else {
          throw new Meteor.Error("addProjectRole failed: user already has role");
        }
      } else {
        throw new Meteor.Error(403);
      }
    },

    /**
     * Remove a project role from a user
     */
    removeProjectRole: function (userId, projectId, role) {
      console.debug("removeProjectRole:", userId, projectId, role);
      var actor = Auth.requireAuthentication(),
          user = Collections.Users.findOne(userId);

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
     * Remove project access from a user
     */
    removeProjectAccess: function (userId, projectId) {
      console.debug("removeProjectAccess:", userId, projectId);
      var actor = Auth.requireAuthentication(),
          user = Collections.Users.findOne(userId);

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
     * Delete a node from a project version (and only from this version!)
     * Also delete items linking to this node (Actions, variants, etc)
     * @param node
     */
    deleteNode: function (nodeId) {
      console.debug("deleteNode:" + nodeId);
      var user = Auth.requireAuthentication();

      if(nodeId){
        var node = Collections.Nodes.findOne(nodeId),
          actionRemoveList = [];

        if(node){
          // Get all of the from this node
          Collections.Actions.find({ nodeId: node.staticId, projectVersionId: node.projectVersionId }).forEach(function (a) {
            Collections.RecordChanges.remove({collection: "actions", recordId: a._id});
            actionRemoveList.push(a._id);
          });

          // Find all of the actions which lead to this node and remove the routes
          Collections.Actions.find({ "routes.nodeId": node.staticId, projectVersionId: node.projectVersionId  }).forEach(function (a) {
            // if the action only leads
            var otherRoutes = a.routes.filter(function (route) { return route.nodeId !== node.staticId});
            if(!otherRoutes.length){
              Collections.RecordChanges.remove({collection: "actions", recordId: a._id});
              actionRemoveList.push(a._id);
            } else {
              // update the action to remove the route
              Collections.Actions.update({_id: a._id}, { $pull: { routes: { nodeId: node.staticId } } });
            }
          });

          // remove all of the actions which link to this node
          Collections.Actions.remove({ _id: {$in: actionRemoveList} });

          // Remove all of the documentation for this node

          // Remove the node itself
          Collections.Nodes.remove({_id: nodeId});

          // Remove the change history for this node
          Collections.RecordChanges.remove({collection: "nodes", recordId: nodeId});
        } else {
          throw new Meteor.Error("Node not found: " + nodeId);
        }
      }
    },

    /**
     * Create a new version, replicating all data from a version
     * @param projectId The project to
     * @param sourceVersionId
     * @param versionString
     */
    createVersion: function (sourceVersionId, versionString) {
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
      var sourceVersion = Collections.ProjectVersions.findOne(sourceVersionId),
        project = Collections.Projects.findOne(sourceVersion.projectId);
      if(sourceVersion && project){
        if(!user.hasAdminAccess(sourceVersion.projectId)){
          throw new Meteor.Error("createVersion: user not authorized");
        }

        // Create the new version record
        var versionId = Collections.ProjectVersions.insert({
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
        var replicateCollections = [Collections.Nodes, Actions];
        _.each(replicateCollections, function (collection) {
          collection.find({ projectVersionId: sourceVersion._id }).forEach(function (record) {
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
    }
  });
});

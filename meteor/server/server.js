/**
 * npm packages
 */
fs            = Npm.require("fs");
path          = Npm.require("path");
childProcess  = Npm.require("child_process");
AdmZip        = Npm.require("adm-zip");
console.debug = console.log;
/**
 * Top level configuration data
 */
DocRoba = {
  rootPath: fs.realpathSync(process.env.PWD)
};

/**
 * Expose these for the client to call
 */
Meteor.startup(function () {
  Meteor.methods({
    echo: function () {
      var user = Auth.requireAuthentication();

      console.debug("Echo called by user " + user._id);
      return { user: user._id, argv: arguments };
    },

    updateNodePlatform: function () {
      var user = Auth.requireAuthentication();

      var setData = function (parentId, versionId, userTypeId, platformId) {
        console.log("setData: ", parentId, versionId, userTypeId, platformId);
        Collections.Nodes.find({parentId: parentId, projectVersionId: versionId}).forEach(function (node) {
          console.log("setData Update: ", node._id, userTypeId, platformId);
          Collections.Nodes.update(node._id, {$set: {userTypeId: userTypeId, platformId: platformId}});
          setData(node.staticId, versionId, userTypeId, platformId);
        });
      };
      Collections.Nodes.find({type: NodeTypes.userType}).forEach(function (userType) {
        // get all of the childNodes
        Collections.Nodes.find({parentId: userType.staticId, projectVersionId: userType.projectVersionId}).forEach(function (node) {
          var platformId;
          if(node.type == NodeTypes.platform){
            platformId = node.staticId;
          }
          Collections.Nodes.update(node._id, {$set: {userTypeId: userType.staticId}});
          setData(node.staticId, userType.projectVersionId, userType.staticId, platformId);
        })
      });
    },

    /**
     * Create a new project
     * @param title
     */
    createProject: function (title) {
      var user = Auth.requireAuthentication();

      if(user && title){
        if(user.isSystemAdmin || Meteor.settings.allowPersonalProjects){
          console.info("Creating project [" + title + "] for user", user._id);

          // Create the project
          var projectId = Collections.Projects.insert({
            owner: user._id,
            title: title
          });

          // Add the project to the user's record
          user.addProjectRole(projectId, RoleTypes.owner);
          return projectId;
        } else {
          throw new Meteor.Error("createProject failed: user not authorized");
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
      var user = Auth.requireAuthentication();

      if(user && projectId){
        if(user.isSystemAdmin || user.hasAdminAccess(projectId)){
          console.info("Deleting project " + projectId + " for user", user._id);

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
          throw new Meteor.Error("deleteProject failed: user not authorized");
        }
      } else {
        throw new Meteor.Error("deleteProject failed: no project specified");
      }
    },

    /**
     * Delete a node from a project version (and only from this version!)
     * Also delete items linking to this node (Actions, variants, etc)
     * @param node
     */
    deleteNode: function (nodeId) {
      var user = Auth.requireAuthentication();

      console.debug("deleteNode: " + nodeId);
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

/**
 * npm packages
 */
fs            = Npm.require("fs");
path          = Npm.require("path");
childProcess  = Npm.require("child_process");
AdmZip        = Npm.require("adm-zip");

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
      // Require authentication
      if(!this.userId){
        throw new Meteor.Error("User is not authenticated");
      }

      Meteor.log.debug("Echo called by user " + this.userId);
      return { user: this.userId, argv: arguments };
    },
    updateNodePlatform: function () {
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
     * Delete a node from a project version (and only from this version!)
     * Also delete items linking to this node (Actions, variants, etc)
     * @param node
     */
    deleteNode: function (nodeId) {
      // Require authentication
      if(!this.userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      Meteor.log.debug("deleteNode: " + nodeId);
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
              Meteor.log.error("createVersion insert failed: " + e.toString());
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

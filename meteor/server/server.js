/**
 * Expose these for the client to call
 */
Meteor.startup(function () {
  // we need a synchronous version of Tokenizer.verify
  Tokenizer.verifySync = Meteor.wrapAsync(Tokenizer.verify);

  Meteor.methods({
    echo: function () {
      // Require authentication
      if(!this.userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      Meteor.log.debug("Echo called by user " + this.userId);
      return { user: this.userId, argv: arguments };
    },

    /**
     * Get a user's real auth token from a one-time token
     * @param token
     */
    getUserToken: function (token) {
      check(token, String);

      // lookup the user before the token is verified and destroyed
      var user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      });

      // make sure there a user associated with the token
      if(user){
        // make sure the token is also valid
        var valid = Tokenizer.verifySync(token);
        if(valid){
          console.log("getUserToken: ", user);
        }
      } else {
        new Meteor.Error(403, 'Error 403: Not authorized');
      }
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
        // Setup the query to get all of the actions connecting to this node
        var nodeActionQuery = {
          $or: [
            { source: nodeId },
            { source: nodeId }
          ]
        };

        // Get all of the actions connected to this and remove all of the commands from them
        Actions.find(nodeActionQuery).forEach(function (a) {
          Commands.find({actionId: a._id}).forEach(function (c) {
            RecordChanges.remove({collection: "commands", recordId: c._id});
          });
          Commands.remove({actionId: a._id});
          RecordChanges.remove({collection: "actions", recordId: a._id});
        });

        // remove all of the actions which link to this node
        Actions.remove(nodeActionQuery);

        // Remove all of the documentation for this node

        // Remove the node itself
        Nodes.remove({_id: nodeId});

        // Remove the change history for this node
        RecordChanges.remove({collection: "nodes", recordId: nodeId});
      }
      //return nodeId;
    },

    /**
     * Create a new version, replicating all data from a version
     * @param projectId The project to
     * @param sourceVersionId
     * @param versionString
     */
    createVersion: function (sourceVersionId, versionString) {
      // Require authentication
      var userId = this.userId;
      if(!userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      // require a full set of source material
      check(sourceVersionId, String);
      check(versionString, String);

      // Validate all of the Ids by pulling in the records
      var sourceVersion = ProjectVersions.findOne(sourceVersionId),
        project = Projects.findOne(sourceVersion.projectId);
      if(sourceVersion && project){
        // validate that the current user has permission to create a new version
        var role = ProjectRoles.findOne({projectId: sourceVersion.projectId, userId: userId});
        if(!role || !(role.role === RoleTypes.admin || role.role === RoleTypes.owner)){
          Meteor.log.error("CreateVersion: user " + userId + " not authorized, " + (role ? role.role : "no role for this project"));
          throw new Meteor.Error("Not Authorized", "You are not authorized to make this change");
        }

        // Create the new version record
        var versionId = ProjectVersions.insert({
          projectId: sourceVersion.projectId,
          version: versionString,
          createdBy: userId,
          modifiedBy: userId
        });

        if(!versionId){
          throw new Meteor.Error("Version Creation Failure", "Failed to create new version record");
        }

        // Replicate all of the important records from the source version
        var replicateCollections = [Nodes, Actions];
        _.each(replicateCollections, function (collection) {
          collection.find({ projectVersionId: sourceVersion._id }).forEach(function (record) {
            var replica = createReplica(record);
            replica.projectVersionId = versionId;
            replica.modifiedBy = userId;
            try {
              collection.insert(replica);
            } catch (e) {
              console.error("Insert failed: ", e.message);
            }
          });
        });

        // done!
        return versionId;
      } else {
        throw new Meteor.Error("Source Data Failure", "Unable to create version from information provided");
      }
    }
  });
});

/**
 * Create a replica record that is ready to be inserted
 * @param record The original record to replicate
 */
var createReplica = function (record) {
  // Leave dateCreated and createdBy intact to preserve documentation history
  return _.omit(record, ["_id", "modifiedBy", "dateModified", "projectVersionId"]);
};
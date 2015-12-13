
/**
 * Methods and publications to enable the adventure execution
 */
Meteor.startup(function () {
  /**
   * DataStore publications
   */
  Meteor.publish('data_stores', function (projectId, projectVersionId) {
    console.log("Publish: data_stores");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.DataStores.find({projectVersionId: projectVersionId});
      }
    }
    console.log("DataStores publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_fields', function (projectId, projectVersionId, dataStoreId) {
    console.log("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId && dataStoreId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.DataStoreFields.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
      }
    }
    console.log("DataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_rows', function (projectId, projectVersionId, dataStoreId) {
    console.log("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId & dataStoreId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.DataStoreRows.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
      }
    }
    console.log("DataStoreRows publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_fields', function (projectId, projectVersionId) {
    console.log("Publish: all_data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.DataStoreFields.find({projectVersionId: projectVersionId});
      }
    }
    console.log("AllDataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_rows', function (projectId, projectVersionId) {
    console.log("Publish: all_data_store_rows");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.DataStoreRows.find({projectVersionId: projectVersionId});
      }
    }
    console.log("AllDataStoreRows publication: returning nothing");
    return [];
  });

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
    /**
     * Get a set of data store rows formatted for a selector
     * @param dataKey
     * @param query
     */
    getRenderedDataStoreRows: function (dataKey, query) {
      check(dataKey, String);
      return DSUtil.getRenderedDataStoreRows(dataKey, query)
    },

    /**
     * Render a datastore row
     * @param rowId
     */
    renderDataStoreRow: function (rowId) {
      check(rowId, String);
      return DSUtil.renderRow(rowId);
    },

    /**
     * Perform an unvalidated insert for a data store row
     * This bypasses the DataStoreRow validation, but validates using the DataStore
     * fabricated schema so it is not a black box
     */
    updateDataStoreRow: function (recordId, update) {
      // Require authentication
      var userId = this.userId;
      if(!userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      // require a full set of source material
      check(recordId, String);
      check(update, Object);

      // pull the DataStoreRow record
      var record = Collections.DataStoreRows.findOne(recordId);
      if(!record){
        throw new Meteor.Error("Update Failed", "Record not found");
      }

      // Validate all of the Ids by pulling in the records
      var sourceVersion = Collections.ProjectVersions.findOne(record.projectVersionId),
        project = Collections.Projects.findOne(sourceVersion.projectId);
      if(sourceVersion && project) {
        // validate that the current user has permission to create a new version
        var role = Collections.ProjectRoles.findOne({projectId: sourceVersion.projectId, userId: userId});
        if (!role || !(role.role === RoleTypes.admin || role.role === RoleTypes.owner)) {
          Meteor.log.error("updateDataStoreRow: user " + userId + " not authorized, " + (role ? role.role : "no role for this project"));
          throw new Meteor.Error("Not Authorized", "You are not authorized to make this change");
        }

        // validate against the schema for this datastore
        var datastore = Collections.DataStores.findOne(record.dataStoreId),
          dsSchema = DSUtil.simpleSchema(datastore.schema),// TODO: these should be cached
          valid = dsSchema.newContext().validate(update);

        if(!valid){
          throw new Meteor.Error("Validated Failed", "Record is not valid");
        }

        Collections.DataStoreRows.update(recordId, {$set: update}, {filter: false, validate: false}, function (error, response) {
          if(error){
            throw new Meteor.Error("DataStoreRow Update Failed", error);
          }
        });
      }
    }
  });
});
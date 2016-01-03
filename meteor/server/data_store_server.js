
/**
 * Methods and publications to enable the adventure execution
 */
Meteor.startup(function () {
  /**
   * DataStore publications
   */
  Meteor.publish('data_stores', function (projectId, projectVersionId) {
    console.debug("Publish: data_stores");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId
        && Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.DataStores.find({projectVersionId: projectVersionId});
    }
    console.warn("DataStores publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_fields', function (projectId, projectVersionId, dataStoreId) {
    console.debug("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId && dataStoreId
        && Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.DataStoreFields.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
    }
    console.warn("DataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_rows', function (projectId, projectVersionId, dataStoreId) {
    console.debug("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId && dataStoreId
        && Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.DataStoreRows.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
    }
    console.warn("DataStoreRows publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_fields', function (projectId, projectVersionId) {
    console.debug("Publish: all_data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId
        && Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.DataStoreFields.find({projectVersionId: projectVersionId});
    }
    console.warn("AllDataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_rows', function (projectId, projectVersionId) {
    console.debug("Publish: all_data_store_rows");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId
        && Auth.hasProjectAccess(this.userId, projectId)){
      return Collections.DataStoreRows.find({projectVersionId: projectVersionId});
    }
    console.warn("AllDataStoreRows publication: returning nothing");
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
      check(this.userId, String);

      // Require authentication
      var user = Meteor.users.findOne(this.userId);
      if(!user){
        throw new Meteor.Error("updateDataStoreRow: user is not authenticated");
      }

      // require a full set of source material
      check(recordId, String);
      check(update, Object);

      // pull the DataStoreRow record
      var record = Collections.DataStoreRows.findOne(recordId);
      if(!record){
        throw new Meteor.Error("updateDataStoreRow: record not found");
      }

      // Check project permissions
      if(!record.projectId || !user.hasTesterAccess(record.projectId)) {
        throw new Meteor.Error("updateDataStoreRow: user is not authorized");
      }

      // Validate all of the Ids by pulling in the records
      var sourceVersion = Collections.ProjectVersions.findOne(record.projectVersionId),
        project = Collections.Projects.findOne(sourceVersion.projectId);
      if(sourceVersion && project) {
        // validate against the schema for this datastore
        var datastore = Collections.DataStores.findOne(record.dataStoreId),
          dsSchema = DSUtil.simpleSchema(datastore.schema),// TODO: these should be cached
          valid = dsSchema.newContext().validate(update);

        if(!valid){
          throw new Meteor.Error("updateDataStoreRow: record is not valid");
        }

        Collections.DataStoreRows.update(recordId, {$set: update}, {filter: false, validate: false}, function (error, response) {
          if(error){
            throw new Meteor.Error("updateDataStoreRow update failed: " + error);
          }
        });
      }
    }
  });
});

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
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return DataStores.find({projectVersionId: projectVersionId});
      }
    }
    console.log("DataStores publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_fields', function (projectId, projectVersionId, dataStoreId) {
    console.log("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId && dataStoreId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return DataStoreFields.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
      }
    }
    console.log("DataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('data_store_rows', function (projectId, projectVersionId, dataStoreId) {
    console.log("Publish: data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId & dataStoreId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return DataStoreRows.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
      }
    }
    console.log("DataStoreRows publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_fields', function (projectId, projectVersionId) {
    console.log("Publish: all_data_store_fields");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return DataStoreFields.find({projectVersionId: projectVersionId});
      }
    }
    console.log("AllDataStoreFields publication: returning nothing");
    return [];
  });
  Meteor.publish('all_data_store_rows', function (projectId, projectVersionId) {
    console.log("Publish: all_data_store_rows");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return DataStoreRows.find({projectVersionId: projectVersionId});
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
    }
  });
});
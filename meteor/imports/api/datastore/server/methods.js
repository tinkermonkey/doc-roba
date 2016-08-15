import {Meteor} from 'meteor/meteor';
import {DSUtil} from '../ds_util.js';
import {DataStores} from '../datastore.js';
import {DataStoreRows} from '../datastore_row.js';
import {Projects} from '../../project/project.js';
import {ProjectVersions} from '../../project/project_version.js';

Meteor.methods({
  /**
   * Get a set of data store rows formatted for a selector
   * @param dataKey
   * @param query
   */
  getRenderedDataStoreRows(dataKey, query) {
    check(dataKey, String);
    return DSUtil.getRenderedDataStoreRows(dataKey, query)
  },

  /**
   * Render a datastore row
   * @param rowId
   */
  renderDataStoreRow(rowId) {
    check(rowId, String);
    return DSUtil.renderRow(rowId);
  },

  /**
   * Perform an unvalidated insert for a data store row
   * This bypasses the DataStoreRow validation, but validates using the DataStore
   * fabricated schema so it is not a black box
   */
  updateDataStoreRow(recordId, update) {
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
    var record = DataStoreRows.findOne(recordId);
    if(!record){
      throw new Meteor.Error("updateDataStoreRow: record not found");
    }
  
    // Check project permissions
    if(!record.projectId || !user.hasTesterAccess(record.projectId)) {
      throw new Meteor.Error("updateDataStoreRow: user is not authorized");
    }
  
    // Validate all of the Ids by pulling in the records
    var sourceVersion = ProjectVersions.findOne(record.projectVersionId),
        project = Projects.findOne(sourceVersion.projectId);
    if(sourceVersion && project) {
      // validate against the schema for this datastore
      var datastore = DataStores.findOne(record.dataStoreId),
          dsSchema = DSUtil.simpleSchema(datastore.schema),// TODO: these should be cached
          valid = dsSchema.newContext().validate(update);
    
      if(!valid){
        throw new Meteor.Error("updateDataStoreRow: record is not valid");
      }
    
      DataStoreRows.update(recordId, {$set: update}, {filter: false, validate: false}, (error, response) => {
        if(error){
          throw new Meteor.Error("updateDataStoreRow update failed: " + error);
        }
      });
    }
  }
});

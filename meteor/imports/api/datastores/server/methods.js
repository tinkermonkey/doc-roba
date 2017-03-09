import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {DSUtil} from '../ds_util.js';
import {Datastores} from '../datastores.js';
import {DatastoreRows} from '../datastore_rows.js';
import {Projects} from '../../projects/projects.js';
import {ProjectVersions} from '../../projects/project_versions.js';

Meteor.methods({
  /**
   * Perform an unvalidated insert for a data store row
   * This bypasses the DatastoreRow validation, but validates using the Datastore
   * fabricated schema so it is not a black box
   */
  updateDatastoreRow(recordId, update) {
    console.log("updateDatastoreRow:", this.userId, Meteor.userId(), recordId);
    // Require authentication
    Auth.requireAuthentication();
  
    // require a full set of source material
    check(recordId, String);
    check(update, Object);
  
    // pull the DatastoreRow record
    var record = DatastoreRows.findOne(recordId);
    if(!record){
      throw new Meteor.Error("record_not_found", "Failed to find datastore row record", recordId);
    }
    
    // Check project access
    Auth.requireProjectAccess(record.projectId);
  
    // Validate all of the Ids by pulling in the records
    var sourceVersion = ProjectVersions.findOne(record.projectVersionId),
        project = Projects.findOne(sourceVersion.projectId);
    if(sourceVersion && project) {
      // validate against the schema for this datastore
      let valid = record.datastore().simpleSchema().newContext().validate(update); // TODO: consider caching these
    
      if(!valid){
        throw new Meteor.Error("updateDatastoreRow: record is not valid");
      }
    
      DatastoreRows.update(recordId, {$set: update}, {filter: false, validate: false}, (error) => {
        if(error){
          throw new Meteor.Error("updateDatastoreRow update failed: " + error);
        }
      });
    }
  }
});

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
  },
  /**
   * Get a rendered datastore row
   * Useful for when you don't want to setup a complex subscription chain
   * @param projectId
   * @param projectVersionId
   * @param rowStaticId
   */
  getRenderedDatastoreRow(projectId, projectVersionId, rowStaticId){
    console.debug("getRenderedDatastoreRow: ", projectId, projectVersionId, rowStaticId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(projectVersionId, String);
    check(rowStaticId, String);
  
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let row = DatastoreRows.findOne({projectVersionId: projectVersionId, staticId: rowStaticId});
      if(row){
        console.log("getRenderedDatastoreRow:", row.render());
        return row.render();
      } else {
        throw new Meteor.Error("404", "Not found", "No DatastoreRow found for staticId [" + rowStaticId + "] and projectVersionId [" + projectVersionId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  }
});

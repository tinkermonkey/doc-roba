import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';

import {Datastores} from '../datastores.js';
import {DatastoreFields} from '../datastore_fields.js';
import {DatastoreRows} from '../datastore_rows.js';

import {DatastoreDataTypes} from '../datastore_data_types.js';
import {DatastoreDataTypeFields} from '../datastore_data_type_fields.js';


Meteor.publish('datastores', function (projectId, projectVersionId) {
  console.debug("Publish: datastores");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return Datastores.find({projectVersionId: projectVersionId});
  }
  console.warn("Datastores publication: returning nothing");
  return [];
});

Meteor.publish('datastore_fields', function (projectId, projectVersionId, dataStoreId) {
  console.debug("Publish: datastore_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId && dataStoreId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreFields.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
  }
  console.warn("DatastoreFields publication: returning nothing");
  return [];
});

Meteor.publish('datastore_rows', function (projectId, projectVersionId, dataStoreId) {
  console.debug("Publish: datastore_rows");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId && dataStoreId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreRows.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
  }
  console.warn("DatastoreRows publication: returning nothing");
  return [];
});

Meteor.publish('datastore_data_types', function (projectId, projectVersionId) {
  console.debug("Publish: datastore_data_types");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreDataTypes.find({projectVersionId: projectVersionId});
  }
  console.warn("DatastoreDataTypes publication: returning nothing");
  return [];
});

Meteor.publish('datastore_data_type_fields', function (projectId, projectVersionId, dataTypeId) {
  console.debug("Publish: datastore_data_type_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId && dataTypeId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreDataTypeFields.find({projectVersionId: projectVersionId, dataTypeId: dataTypeId});
  }
  console.warn("DatastoreDataTypeFields publication: returning nothing");
  return [];
});

Meteor.publish('version_datastore_fields', function (projectId, projectVersionId) {
  console.debug("Publish: version_datastore_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreFields.find({projectVersionId: projectVersionId});
  }
  console.warn("AllDatastoreFields publication: returning nothing");
  return [];
});

Meteor.publish('version_datastore_data_type_fields', function (projectId, projectVersionId) {
  console.debug("Publish: version_datastore_data_type_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreDataTypeFields.find({projectVersionId: projectVersionId});
  }
  console.warn("AllDatastoreDataTypeFields publication: returning nothing");
  return [];
});

Meteor.publish('version_datastore_rows', function (projectId, projectVersionId) {
  console.debug("Publish: version_datastore_rows");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DatastoreRows.find({projectVersionId: projectVersionId});
  }
  console.warn("AllDatastoreRows publication: returning nothing");
  return [];
});

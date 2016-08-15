import {Meteor} from 'meteor/meteor';
import {DataStores} from '../datastore.js';
import {DataStoreFields} from '../datastore_field.js';
import {DataStoreRows} from '../datastore_row.js';

Meteor.publish('data_stores', function (projectId, projectVersionId) {
  console.debug("Publish: data_stores");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DataStores.find({projectVersionId: projectVersionId});
  }
  console.warn("DataStores publication: returning nothing");
  return [];
});

Meteor.publish('data_store_fields', function (projectId, projectVersionId, dataStoreId) {
  console.debug("Publish: data_store_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId && dataStoreId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DataStoreFields.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
  }
  console.warn("DataStoreFields publication: returning nothing");
  return [];
});

Meteor.publish('data_store_rows', function (projectId, projectVersionId, dataStoreId) {
  console.debug("Publish: data_store_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId && dataStoreId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DataStoreRows.find({projectVersionId: projectVersionId, dataStoreId: dataStoreId});
  }
  console.warn("DataStoreRows publication: returning nothing");
  return [];
});

Meteor.publish('all_data_store_fields', function (projectId, projectVersionId) {
  console.debug("Publish: all_data_store_fields");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DataStoreFields.find({projectVersionId: projectVersionId});
  }
  console.warn("AllDataStoreFields publication: returning nothing");
  return [];
});

Meteor.publish('all_data_store_rows', function (projectId, projectVersionId) {
  console.debug("Publish: all_data_store_rows");
  // check that there is a project role for the current user
  if(this.userId && projectId && projectVersionId
      && Auth.hasProjectAccess(this.userId, projectId)){
    return DataStoreRows.find({projectVersionId: projectVersionId});
  }
  console.warn("AllDataStoreRows publication: returning nothing");
  return [];
});

import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import {ChangeTypes} from './change_types.js';
import {RecordChanges} from './record_changes.js';

/**
 * Define a list of fields which will automatically be pulled off of the changed record
 * and added to the change record
 *
 * @type {Array}
 */
let changePullList = [
  'projectId',
  'projectVersionId'
];

/**
 * Define a list of fields which will be ignored for the list of changes
 *
 * @type {Array}
 */
let changeIgnoreList = [
  'dateModified',
  'modifiedBy',
  'dateCreated',
  'createdBy'
];

/**
 * Provide a universal mechanism to hook up the change tracking
 * @param collection The collection to add hooks to
 * @param collectionName The name to user to store changes under
 */
export const ChangeTracker = {
  TrackChanges (collection, collectionName) {
    // Only run on the server
    if(!Meteor.isServer){
      return;
    }
    
    // After insert tracking
    collection.after.insert(function (userId, record) {
      console.log("Inserted: ", userId, collectionName, record._id);
      
      // Store a record of the change
      let change = {
        collection: collectionName,
        recordId: record._id,
        recordStaticId: record.staticId,
        userId: userId ? userId : record.modifiedBy,
        type: ChangeTypes.created,
        record: record
      };
      
      // Auto-pull list
      _.each(changePullList, function (field) { if(record[field]){ change[field] = record[field]; }});
      
      // Store the change
      RecordChanges.insert(change);
    });
    
    // After update tracking
    collection.after.update(function (userId, record, changedFields) {
      console.log("Updated: ", userId, collectionName, record._id, changedFields);
      
      // Filter the change list
      changedFields = _.difference(changedFields, changeIgnoreList);
      
      // Store a record of the change
      let oldRecord = this.previous,
          change = {
            collection: collectionName,
            recordId: record._id,
            recordStaticId: record.staticId,
            userId: userId ? userId : record.modifiedBy,
            type: ChangeTypes.updated,
            fields: changedFields,
            values: [],
            record: record
          };
      
      // Store the old and new values for
      _.each(changedFields, function (fieldName) {
        change.values.push({
          field: fieldName,
          old: oldRecord[fieldName],
          new: record[fieldName]
        });
      });
      
      // Auto-pull list
      _.each(changePullList, function (field) { if(record[field]){ change[field] = record[field]; }});
      
      // Store the change
      RecordChanges.insert(change);
    }, {fetchPrevious: true});
    
    // After remove tracking
    collection.after.remove(function (userId, record) {
      console.log("Removed: ", userId, collectionName, record._id);
      
      // Store a record of the change
      let change = {
        collection: collectionName,
        recordId: record._id,
        recordStaticId: record.staticId,
        userId: userId ? userId : record.modifiedBy,
        type: ChangeTypes.created,
        record: record
      };
      
      // Auto-pull list
      _.each(changePullList, function (field) { if(record[field]){ change[field] = record[field]; }});
      
      // Store the change
      RecordChanges.insert(change);
    });
  }
};
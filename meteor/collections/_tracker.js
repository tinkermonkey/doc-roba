/**
 * Change Types
 */
ChangeTypes = {
  created: 0,
  updated: 1,
  destroyed: 2
};
ChangeTypesLookup = _.invert(ChangeTypes);

/**
 * Keep track of changes for certain records
 */
Schemas.RecordChange = new SimpleSchema({
  collection: {
    type: String,
    denyUpdate: true
  },
  recordId: {
    type: String,
    denyUpdate: true
  },
  recordStaticId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  userId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  projectId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  projectVersionId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  type: {
    type: Number,
    allowedValues: _.map(ChangeTypes, function (d) { return d; }),
    optional: true,
    denyUpdate: true
  },
  fields: {
    type: [String],
    optional: true,
    denyUpdate: true
  },
  values: {
    type: [Object],
    blackbox: true,
    optional: true,
    denyUpdate: true
  },
  record: {
    type: Object,
    blackbox: true,
    denyUpdate: true
  },
  date: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  }
});
Collections.RecordChanges = new Meteor.Collection("record_changes");
Collections.RecordChanges.attachSchema(Schemas.RecordChange);

/**
 * Define a list of fields which will automatically be pulled off of the changed record
 * and added to the change record
 *
 * @type {Array}
 */
var changePullList = [
  'projectId',
  'projectVersionId'
];

/**
 * Define a list of fields which will be ignored for the list of changes
 *
 * @type {Array}
 */
var changeIgnoreList = [
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
trackChanges = function (collection, collectionName) {
  // Only run on the server
  if(!Meteor.isServer){
    return;
  }

  // After insert tracking
  collection.after.insert(function (userId, record) {
    console.log("Inserted: ", userId, collectionName, record._id);

    // Store a record of the change
    var change = {
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
    Collections.RecordChanges.insert(change);
  });

  // After update tracking
  collection.after.update(function (userId, record, changedFields) {
    console.log("Updated: ", userId, collectionName, record._id, changedFields);

    // Filter the change list
    changedFields = _.difference(changedFields, changeIgnoreList);

    // Store a record of the change
    var oldRecord = this.previous,
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
    Collections.RecordChanges.insert(change);
  }, {fetchPrevious: true});

  // After remove tracking
  collection.after.remove(function (userId, record) {
    console.log("Removed: ", userId, collectionName, record._id);

    // Store a record of the change
    var change = {
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
    Collections.RecordChanges.insert(change);
  });
};
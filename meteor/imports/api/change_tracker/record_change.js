import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ChangeTypes} from './change_types.js';
import {SchemaHelpers} from '../_lib/schema_helpers.js';

/**
 * Track changes to records to provide a history of edits
 */
export const RecordChange = new SimpleSchema({
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
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  }
});
export const RecordChanges = new Meteor.Collection("record_changes");
RecordChanges.attachSchema(RecordChange);

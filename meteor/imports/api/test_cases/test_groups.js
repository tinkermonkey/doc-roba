import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestCases} from './test_cases.js';

/**
 * A simple means of grouping tests
 */
export const TestGroup = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this group belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this group belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to another group perhaps via the staticId
  parentGroupId: {
    type: String,
    optional: true
  },
  // Group title
  title: {
    type: String
  },
  // Perhaps we'll have descriptions
  description: {
    type: String,
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const TestGroups = new Mongo.Collection("test_groups");
TestGroups.attachSchema(TestGroup);
TestGroups.deny(Auth.ruleSets.deny.ifNotTester);
TestGroups.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestGroups, "test_groups");

/**
 * Helpers
 */
TestGroups.helpers({
  groups() {
    return TestGroups.find({ parentGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  },
  testCases() {
    return TestCases.find({ testGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  }
});
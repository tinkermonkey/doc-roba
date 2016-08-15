import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';

/**
 * Test Run Template - A named template for a test run
 */
export const TestPlan = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this test belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test case via the staticId
  parentTemplateId: {
    type: String,
    optional: true
  },
  // Order if part of a larger test run
  order: {
    type: Number,
    optional: true
  },
  // Template Title
  title: {
    type: String
  },
  // Longer description of the test run template
  description: {
    type: String,
    optional: true
  },
  // Unique identifier for launching this test run programatically
  identifier: {
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
  }
});
export const TestPlans = new Mongo.Collection("test_plan");
TestPlans.attachSchema(TestPlan);
TestPlans.deny(Auth.ruleSets.deny.ifNotTester);
TestPlans.allow(Auth.ruleSets.allow.ifAuthenticated);

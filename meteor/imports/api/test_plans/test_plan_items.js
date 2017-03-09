import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {TestRunItemTypes} from '../test_runs/test_run_item_types.js';

/**
 * Test Run Template Test - a test setup in a named run config
 */
export const TestPlanItem = new SimpleSchema({
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
  // Link to the template
  testPlanId: {
    type: String,
    denyUpdate: true
  },
  // Link to the parent structure (template, stage) by staticId
  parentId: {
    type: String
  },
  // Bind to the static Type constant
  type: {
    type: Number,
    allowedValues: _.map(TestRunItemTypes, function (d) { return d; })
  },
  // Item order
  order: {
    type: Number,
    decimal: true
  },
  // Item config
  config: {
    type: Object,
    blackbox: true
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
export const TestPlanItems = new Mongo.Collection("test_plan_items");
TestPlanItems.attachSchema(TestPlanItem);
TestPlanItems.deny(Auth.ruleSets.deny.ifNotTester);
TestPlanItems.allow(Auth.ruleSets.allow.ifAuthenticated);


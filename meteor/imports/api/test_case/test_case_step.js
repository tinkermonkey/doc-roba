import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestCaseStepTypes} from './test_case_step_types.js';
import {Nodes} from '../nodes/nodes.js';
import {Actions} from '../action/action.js';

/**
 * Test case step - a single test step for a single user
 */
export const TestCaseStep = new SimpleSchema({
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
  testCaseId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String,
    denyUpdate: true
  },
  // Step order
  order: {
    type: Number
  },
  // Bind to the static Type constant
  type: {
    type: Number,
    allowedValues: _.map(TestCaseStepTypes, function (d) { return d; })
  },
  // Step data
  data: {
    type: Object,
    blackbox: true,
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
export const TestCaseSteps = new Mongo.Collection("test_case_steps");
TestCaseSteps.attachSchema(TestCaseStep);
TestCaseSteps.deny(Auth.ruleSets.deny.ifNotTester);
TestCaseSteps.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestCaseSteps, "test_case_steps");

/**
 * Helpers
 */
TestCaseSteps.helpers({
  firstNode() {
    if(this.data && (this.data.nodeId || this.data.sourceId)){
      return Nodes.findOne({staticId: this.data.nodeId || this.data.sourceId, projectVersionId: this.projectVersionId});
    }
  },
  action() {
    if(this.data && this.data.actionId){
      return Actions.findOne({staticId: this.data.actionId, projectVersionId: this.projectVersionId});
    }
  }
});
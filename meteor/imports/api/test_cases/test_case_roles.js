import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestCaseSteps} from './/test_case_step.js';

/**
 * Test case role - the actions of one user for a test
 */
export const TestCaseRole = new SimpleSchema({
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
  // Role title
  title: {
    type: String
  },
  // Description of this role
  description: {
    type: String,
    optional: true
  },
  // Step order
  order: {
    type: Number
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
export const TestCaseRoles = new Mongo.Collection("test_case_roles");
TestCaseRoles.attachSchema(TestCaseRole);
TestCaseRoles.deny(Auth.ruleSets.deny.ifNotTester);
TestCaseRoles.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestCaseRoles, "test_case_roles");

/**
 * Helpers
 */
TestCaseRoles.helpers({
  steps() {
    return TestCaseSteps.find({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  step(order) {
    return TestCaseSteps.findOne({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId, order: order});
  },
  platform() {
    var firstStep = this.step(0);
    if(firstStep && firstStep.firstNode()){
      return firstStep.firstNode().platform();
    }
  },
  userType() {
    var firstStep = TestCaseSteps.findOne({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId, order: 0});
    if(firstStep && firstStep.firstNode()){
      return firstStep.firstNode().userType();
    }
  }
});
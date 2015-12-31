/**
 * ============================================================================
 * Test case role - the actions of one user for a test
 * ============================================================================
 */
Schemas.TestCaseRole = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Collections.TestCaseRoles = new Mongo.Collection("test_case_roles");
Collections.TestCaseRoles.attachSchema(Schemas.TestCaseRole);
Collections.TestCaseRoles.deny(Auth.ruleSets.deny.ifNotTester);
Collections.TestCaseRoles.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.TestCaseRoles, "test_case_roles");

/**
 * Helpers
 */
Collections.TestCaseRoles.helpers({
  steps: function () {
    return Collections.TestCaseSteps.find({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  step: function (order) {
    return Collections.TestCaseSteps.findOne({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId, order: order});
  },
  platform: function () {
    var firstStep = this.step(0);
    if(firstStep && firstStep.firstNode()){
      return firstStep.firstNode().platform();
    }
  },
  userType: function () {
    var firstStep = Collections.TestCaseSteps.findOne({testCaseRoleId: this.staticId, projectVersionId: this.projectVersionId, order: 0});
    if(firstStep && firstStep.firstNode()){
      return firstStep.firstNode().userType();
    }
  }
});
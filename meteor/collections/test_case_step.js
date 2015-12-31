/**
 * ============================================================================
 * Test case step - a single test step for a single user
 * ============================================================================
 */
Schemas.TestCaseStep = new SimpleSchema({
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
Collections.TestCaseSteps = new Mongo.Collection("test_case_steps");
Collections.TestCaseSteps.attachSchema(Schemas.TestCaseStep);
Collections.TestCaseSteps.deny(Auth.ruleSets.deny.ifNotTester);
Collections.TestCaseSteps.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.TestCaseSteps, "test_case_steps");

/**
 * Helpers
 */
Collections.TestCaseSteps.helpers({
  firstNode: function () {
    if(this.data.nodeId || this.data.sourceId){
      return Collections.Nodes.findOne({staticId: this.data.nodeId || this.data.sourceId, projectVersionId: this.projectVersionId});
    }
  },
  action: function () {
    if(this.data.actionId){
      return Collections.Actions.findOne({staticId: this.data.actionId, projectVersionId: this.projectVersionId});
    }
  }
});
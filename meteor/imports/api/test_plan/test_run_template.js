/**
 * Test Run Template - A named template for a test run
 */
TestRunTemplate = new SimpleSchema({
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  }
});
TestRunTemplates = new Mongo.Collection("test_run_templates");
TestRunTemplates.attachSchema(TestRunTemplate);
TestRunTemplates.deny(Auth.ruleSets.deny.ifNotTester);
TestRunTemplates.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Test Run Template Test - a test setup in a named run config
 */
TestRunTemplateItem = new SimpleSchema({
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
  // Link to the template
  templateId: {
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  }
});
TestRunTemplateItems = new Mongo.Collection("test_run_template_items");
TestRunTemplateItems.attachSchema(TestRunTemplateItem);
TestRunTemplateItems.deny(Auth.ruleSets.deny.ifNotTester);
TestRunTemplateItems.allow(Auth.ruleSets.allow.ifAuthenticated);

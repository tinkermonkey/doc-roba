/**
 * ============================================================================
 * Browsers, Appium outlets, etc
 * ============================================================================
 */
Schemas.TestAgent = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this test agent belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test agent belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // The test agent type
  type: {
    type: Number,
    allowedValues: _.map(TestAgentTypes, function (d) { return d; })
  },
  // The test agent os
  os: {
    type: Number,
    allowedValues: _.map(TestAgentOS, function (d) { return d; })
  },
  // test agent OS version
  osVersion: {
    type: String,
    optional: true
  },
  // Colloquial name for the test agent (browser name)
  title: {
    type: String
  },
  identifier: {
    type: String,
    optional: true
  },
  version: {
    type: String,
    optional: true
  },
  // Black box for configuration
  config: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Sort order
  order: {
    type: Number
  }
});
Collections.TestAgents = new Mongo.Collection("test_agents");
Collections.TestAgents.attachSchema(Schemas.TestAgent);
Collections.TestAgents.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Collections.TestAgents.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(Collections.TestAgents, "test_agents");

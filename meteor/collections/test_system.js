/**
 * ============================================================================
 * Test Systems for accessing test agents
 * ============================================================================
 */
Schemas.TestSystem = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this test system belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test system belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // The automation platform
  type: {
    type: Number,
    allowedValues: _.map(TestAgentTypes, function (d) { return d; })
  },
  // Colloquial name for the test system
  title: {
    type: String
  },
  // Base url for accessing the test system
  hostname: {
    type: String
  },
  // Port for accessing the test system
  port: {
    type: String
  },
  // The list of test agents on this test system (just the staticId)
  testAgents: {
    type: [String],
    optional: true
  },
  // Black box for configuration
  config: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Sort order
  active: {
    type: Boolean
  },
  // Status of the test system process
  status: {
    type: Number,
    allowedValues: _.map(TestSystemStatus, function (d) { return d; }),
    defaultValue: TestSystemStatus.notRunning
  },
  // Sort order
  order: {
    type: Number
  }
});
TestSystems = new Mongo.Collection("test_systems");
TestSystems.attachSchema(Schemas.TestSystem);
TestSystems.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestSystems.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(TestSystems, "test_systems");

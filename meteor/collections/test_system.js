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
Collections.TestSystems = new Mongo.Collection("test_systems");
Collections.TestSystems.attachSchema(Schemas.TestSystem);
Collections.TestSystems.deny(Auth.ruleSets.deny.ifNotTester);
Collections.TestSystems.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.TestSystems, "test_systems");

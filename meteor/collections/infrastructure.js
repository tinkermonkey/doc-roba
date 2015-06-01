/**
 * ============================================================================
 * Servers for testing & documenting
 * ============================================================================
 */
Schemas.Server = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this server belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this server belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Colloquial name for the server
  title: {
    type: String
  },
  // Base url for accessing the server
  url: {
    type: String
  },
  // Sort order
  active: {
    type: Boolean
  },
  // Sort order
  order: {
    type: Number
  }
});
Servers = new Mongo.Collection("servers");
Servers.attachSchema(Schemas.Server);
Servers.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Servers.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(Servers, "servers");

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
TestAgents = new Mongo.Collection("test_agents");
TestAgents.attachSchema(Schemas.TestAgent);
TestAgents.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestAgents.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(TestAgents, "test_agents");

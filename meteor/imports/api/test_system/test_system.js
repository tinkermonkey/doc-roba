import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestAgentTypes} from '../test_agent/test_agent_types';
import {TestSystemStatus} from './test_system_status.js';

/**
 * Test Systems for accessing test agents
 */
export const TestSystem = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
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
    type: Boolean,
    defaultValue: false
  },
  // Status of the test system process
  status: {
    type: Number,
    allowedValues: _.map(TestSystemStatus, function (d) { return d; }),
    defaultValue: TestSystemStatus.notRunning
  },
  // The response returned from the system
  statusResponse: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // Sort order
  order: {
    type: Number
  }
});
export const TestSystems = new Mongo.Collection("test_systems");
TestSystems.attachSchema(TestSystem);
TestSystems.deny(Auth.ruleSets.deny.ifNotTester);
TestSystems.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestSystems, "test_systems");

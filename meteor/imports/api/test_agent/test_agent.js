import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../_lib/schema_helpers.js';
import {Auth} from '../_lib/auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestAgentTypes} from './test_agent_types.js';
import {TestAgentOS} from './test_agent_os.js';

/**
 * Browsers, Appium outlets, etc
 */
export const TestAgent = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
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
export const TestAgents = new Mongo.Collection("test_agents");
TestAgents.attachSchema(TestAgent);
TestAgents.deny(Auth.ruleSets.deny.ifNotTester);
TestAgents.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestAgents, "test_agents");

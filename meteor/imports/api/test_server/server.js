import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

/**
 * Servers for testing & documenting
 */
export const Server = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
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
  // Server Configuration
  config: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // DB connection info
  dbConfig: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Sort order
  order: {
    type: Number
  }
});
export const Servers = new Mongo.Collection("servers");
Servers.attachSchema(Server);
Servers.deny(Auth.ruleSets.deny.ifNotTester);
Servers.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Servers, "servers");

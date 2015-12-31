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
Collections.Servers = new Mongo.Collection("servers");
Collections.Servers.attachSchema(Schemas.Server);
Collections.Servers.deny(Auth.ruleSets.deny.ifNotTester);
Collections.Servers.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.Servers, "servers");

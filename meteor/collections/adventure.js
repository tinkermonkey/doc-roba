/**
 * ============================================================================
 * An single foray
 * ============================================================================
 */
Schemas.Adventure = new SimpleSchema({
  // Link to the project to which this adventure belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this adventure belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test system on which the adventure will execute
  testSystemId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test agent to execute this adventure with
  testAgentId: {
    type: String,
    denyUpdate: true
  },
  // Link to the server we're running against
  serverId: {
    type: String,
    denyUpdate: true
  },
  // The route to take
  route: {
    type: Object,
    blackbox: true
  },
  // The data context to operate in
  dataContext: {
    type: Object,
    blackbox: true
  },
  // Whether to wait for commands at the end of the adventure
  waitForCommands: {
    type: Boolean,
    defaultValue: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(AdventureStatus, function (d) { return d; }),
    defaultValue: AdventureStatus.staged
  },
  // The last known location
  lastKnownNode: {
    type: String,
    optional: true
  },
  // The process id for this adventure
  pid: {
    type: Number,
    optional: true
  },
  // An abort flag
  abort: {
    type: Boolean,
    defaultValue: false
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
Collections.Adventures = new Mongo.Collection("adventures");
Collections.Adventures.attachSchema(Schemas.Adventure);
Collections.Adventures.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.Adventures.allow(Auth.ruleSets.allow.ifAuthenticated);

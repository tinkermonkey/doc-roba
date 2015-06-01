/**
 * ============================================================================
 * A step for an adventure
 * ============================================================================
 */
Schemas.AdventureStep = new SimpleSchema({
  // Link to the project to which this adventure belongs
  // Used for lightweight permissions checking
  projectId: {
    type: String,
    denyUpdate: true
  },
  // The parent adventure
  adventureId: {
    type: String,
    denyUpdate: true
  },
  // The action that this step starts with
  actionId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // The node that this step should lead to
  nodeId: {
    type: String,
    denyUpdate: true
  },
  // Order in which to execute this action
  order: {
    type: Number
  },
  status: {
    type: Number,
    allowedValues: _.map(AdventureStepStatus, function (d) { return d; }),
    defaultValue: AdventureStepStatus.staged
  }
});
AdventureSteps = new Mongo.Collection("adventure_steps");
AdventureSteps.attachSchema(Schemas.AdventureStep);
AdventureSteps.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
AdventureSteps.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * An simple command for an adventure
 * ============================================================================
 */
Schemas.AdventureCommand = new SimpleSchema({
  // Link to the project to which this adventure belongs
  // Used for lightweight permissions checking
  projectId: {
    type: String,
    denyUpdate: true
  },
  // The parent adventure
  adventureId: {
    type: String,
    denyUpdate: true
  },
  // The command itself
  code: {
    type: String,
    denyUpdate: true
  },
  // The result of the command
  result: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Should the adventure state be updated after this command?
  updateState: {
    type: Boolean,
    defaultValue: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(AdventureStepStatus, function (d) { return d; }),
    defaultValue: AdventureStepStatus.staged
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
AdventureCommands = new Mongo.Collection("adventure_commands");
AdventureCommands.attachSchema(Schemas.AdventureCommand);
AdventureCommands.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
AdventureCommands.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * The current state of an adventure (url, screenshot, etc)
 * ============================================================================
 */
// This collection is schema-less because it's just a black box
AdventureStates = new Mongo.Collection("adventure_states");
AdventureStates.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated
});

/**
 * ============================================================================
 * An single foray into the web
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
Adventures = new Mongo.Collection("adventures");
Adventures.attachSchema(Schemas.Adventure);
Adventures.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Adventures.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

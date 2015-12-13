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
Collections.AdventureCommands = new Mongo.Collection("adventure_commands");
Collections.AdventureCommands.attachSchema(Schemas.AdventureCommand);
Collections.AdventureCommands.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Collections.AdventureCommands.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

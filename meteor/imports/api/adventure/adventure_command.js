import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../_lib/schema_helpers.js';
import {Auth} from '../_lib/auth.js';
import {AdventureStepStatus} from './adventure_step_status.js';

/**
 * A simple command for an adventure
 */
export const AdventureCommand = new SimpleSchema({
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
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  }
});
export const AdventureCommands = new Mongo.Collection("adventure_commands");
AdventureCommands.attachSchema(AdventureCommand);
AdventureCommands.deny(Auth.ruleSets.deny.ifNoProjectAccess);
AdventureCommands.allow(Auth.ruleSets.allow.ifAuthenticated);

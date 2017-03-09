import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {AdventureStepStatus} from './adventure_step_status.js';

/**
 * A step in a pre-planned adventure route
 */
export const AdventureStep = new SimpleSchema({
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
  },
  result: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

export const AdventureSteps = new Mongo.Collection("adventure_steps");
AdventureSteps.attachSchema(AdventureStep);
AdventureSteps.deny(Auth.ruleSets.deny.ifNoProjectAccess);
AdventureSteps.allow(Auth.ruleSets.allow.ifAuthenticated);

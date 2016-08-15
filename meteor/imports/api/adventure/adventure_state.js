import {Mongo} from 'meteor/mongo';
import {Auth} from '../auth.js';

/**
 * The current state of an adventure (url, screenshot, etc)
 */
// This collection is schema-less because it's just a black box
export const AdventureStates = new Mongo.Collection("adventure_states");
AdventureStates.deny(Auth.ruleSets.deny.ifNoProjectAccess);
AdventureStates.allow(Auth.ruleSets.allow.ifAuthenticated);

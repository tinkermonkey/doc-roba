import {Mongo} from 'meteor/mongo';
import {Auth} from '../auth.js';

/**
 * Log messages
 * This is schema-less
 * @type {Mongo.Collection}
 */
export const LogMessages = new Mongo.Collection("log_messages");
LogMessages.deny(Auth.ruleSets.deny.ifNoProjectAccess);
LogMessages.allow(Auth.ruleSets.allow.ifAuthenticated);

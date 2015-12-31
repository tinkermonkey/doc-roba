/**
 * Log messages
 * This is schema-less
 * @type {Mongo.Collection}
 */
Collections.LogMessages = new Mongo.Collection("log_messages");
Collections.LogMessages.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.LogMessages.allow(Auth.ruleSets.allow.ifAuthenticated);

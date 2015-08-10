/**
 * Log messages
 * This is schema-less
 * @type {Mongo.Collection}
 */
LogMessages = new Mongo.Collection("log_messages");

/**
 * ============================================================================
 * Generalized code snippets which are attached to various objects
 * ============================================================================
 */
Schemas.CodeSnippet = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this group belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this group belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // The namespace
  namespace: {
    type: String,
    denyUpdate: true
  }
});
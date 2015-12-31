/**
 * ============================================================================
 * A simple means of grouping tests
 * ============================================================================
 */
Schemas.TestGroup = new SimpleSchema({
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
  // Link to another group perhaps via the staticId
  parentGroupId: {
    type: String,
    optional: true
  },
  // Group title
  title: {
    type: String
  },
  // Perhaps we'll have descriptions
  description: {
    type: String,
    optional: true
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
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Collections.TestGroups = new Mongo.Collection("test_groups");
Collections.TestGroups.attachSchema(Schemas.TestGroup);
Collections.TestGroups.deny(Auth.ruleSets.deny.ifNotTester);
Collections.TestGroups.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.TestGroups, "test_groups");

/**
 * Helpers
 */
Collections.TestGroups.helpers({
  groups: function () {
    return Collections.TestGroups.find({ parentGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  },
  testCases: function () {
    return Collections.TestCases.find({ testGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  }
});
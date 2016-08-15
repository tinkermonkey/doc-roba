/**
 * A simple means of grouping tests
 */
TestGroup = new SimpleSchema({
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
TestGroups = new Mongo.Collection("test_groups");
TestGroups.attachSchema(TestGroup);
TestGroups.deny(Auth.ruleSets.deny.ifNotTester);
TestGroups.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestGroups, "test_groups");

/**
 * Helpers
 */
TestGroups.helpers({
  groups: function () {
    return TestGroups.find({ parentGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  },
  testCases: function () {
    return TestCases.find({ testGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } })
  }
});
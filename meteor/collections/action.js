/**
 * ============================================================================
 * Automation actions
 * ============================================================================
 */
Schemas.Action = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this node belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this node belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Document title, does not need to be unique
  title: {
    type: String
  },
  // Link to the static ID of the From node
  nodeId: {
    type: String
  },
  // Keep track of data requirements
  variables: {
    type: [ Schemas.ActionVariable ],
    optional: true
  },
  // Store the decisions which lead to the various nodes
  routes: {
    type: [ Schemas.ActionRoute ]
  },
  // The code to execute the action
  // Not really optional, but it needs to be nullable
  code: {
    type: String,
    defaultValue: "",
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
Actions = new Mongo.Collection("actions");
Actions.attachSchema(Schemas.Action);
Actions.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Actions.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(Actions, "actions");
autoUpdateOrder(Actions, ["variables", "routes"]);
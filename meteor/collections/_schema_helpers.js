/**
 * Define this global for use in all of the collections
 */
Schemas = {};

/**
 * ============================================================================
 * Define global helper functions used in the schemas
 * ============================================================================
 */
// Generate an ID value if one does not exist
autoValueObjectId = function () {
  // only set this field if there is not an existing value
  if(!this.isSet && this.isInsert){
    return new Mongo.ObjectID()._str;
  }
};

// Return the data created if this is an insert operation
autoValueDateCreated = function () {
  // Check if the value is already set, and respect it if it s
  if(this.isInsert){
    return new Date;
  } else if (this.isUpsert) {
    return { $setOnInsert: new Date };
  }
};

// Return a new date
autoValueDateModified = function () {
  return new Date;
};

// Return the current user if this is an insert
autoValueCreatedBy = function () {
  if(this.userId){
    // Check if the value is already set, and respect it if it s
    if(this.isInsert){
      return this.userId;
    } else if (this.isUpsert) {
      return { $setOnInsert: this.userId };
    }
  }
};

// Return the userId
autoValueModifiedBy = function () {
  if(this.userId){
    return this.userId;
  }
};

/**
 * ============================================================================
 * Define global allow/deny functions
 * ============================================================================
 */
allowIfAuthenticated = function (userId, doc) {
  return userId !== null;
};
allowIfAdmin = function (userId, doc) {
  var pr = ProjectRoles.findOne({userId: userId, projectId: doc.projectId});
  return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
};
allowIfTester = function (userId, doc) {
  var pr = ProjectRoles.findOne({userId: userId, projectId: doc.projectId});
  return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner || pr.role === RoleTypes.tester));
};

/**
 * ============================================================================
 * Define globals here so they can be used in the definition of the schemas
 * ============================================================================
 */

/**
 * Types of nodes for the documentation
 */
NodeTypes = {
  root: 0,
  userType: 1,
  platform: 2,
  page: 3,
  view: 4,
  navMenu: 5
};
NodeTypesLookup = _.invert(NodeTypes);

/**
 * Node documentation reference doc types
 */
ReferenceTypes = {
  spec: 0,
  wireFrame: 1,
  visualDesign: 2,
  customerRequirement: 3
};
ReferenceTypesLookup = _.invert(ReferenceTypes);

/**
 * Automation status'
 */
StatusTypes = {
  created: 0,
  staged: 1,
  ready: 2,
  executing: 3,
  complete: 4,
  abort: 5,
  aborted: 6
};
StatusTypesLookup = _.invert(StatusTypes);

/**
 * Project Roles
 */
RoleTypes = {
  owner: 0,
  admin: 1,
  tester: 2,
  developer: 3,
  documentation: 4
};
RoleTypesLookup = _.invert(RoleTypes);

/**
 * Credentials Field Types
 */
FieldTypes = {
  string: 0,
  boolean: 1,
  number: 2,
  date: 3,
  custom: 4
};
FieldTypesLookup = _.invert(FieldTypes);

/**
 * DataStore Categories
 */
DataStoreCategories = {
  userType: "user_type",
  userTypeCustom: "user_type_custom",
  custom: "custom"
};
DataStoreCategoriesLookup = _.invert(DataStoreCategories);

/**
 * Base Automation Platforms
 */
TestAgentTypes = {
  selenium: 0,
  appium: 1,
  grid: 2
};
TestAgentTypesLookup = _.invert(TestAgentTypes);

/**
 * Base Operating Systems
 */
TestAgentOS = {
  Windows: 0,
  Mac: 1,
  Linux: 2,
  iOS: 3,
  Android: 4,
  FirefoxOS: 5
};
TestAgentOSLookup = _.invert(TestAgentOS);

/**
 * Status flags for the helper process
 */
TestSystemStatus = {
  notRunning: 0,
  running: 1,
  error: 2
};
TestSystemStatusLookup = _.invert(TestSystemStatus);

/**
 * Status flags for the adventure process
 */
AdventureStatus = {
  staged: 0,
  queued: 1,
  launched: 2,
  routing: 3,
  executingCommand: 4,
  awaitingCommand: 5,
  paused: 6,
  complete: 7,
  error: 8,
  failed: 9
};
AdventureStatusLookup = _.invert(AdventureStatus);

/**
 * Status flags for an adventure or test action
 */
AdventureStepStatus = {
  staged: 0,
  queued: 1,
  running: 2,
  complete: 3,
  error: 4
};
AdventureStepStatusLookup = _.invert(AdventureStepStatus);

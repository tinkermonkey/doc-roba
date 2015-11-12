
/**
 * ============================================================================
 * Enums and enum lookups
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
  navMenu: 5,
  email: 6
};
NodeTypesLookup = _.invert(NodeTypes);

/**
 * High level platform types
 */
PlatformTypes = {
  web: 0,
  mobileWeb: 1,
  mobileApp: 2,
  email: 3
};
PlatformTypesLookup = _.invert(PlatformTypes);

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
  custom: "custom",
  serverConfig: "server_config"
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

/**
 * Test Case step types
 */
TestCaseStepTypes = {
  node: 0,
  action: 1,
  navigate: 2,
  wait: 3,
  custom: 4
};
TestCaseStepTypesLookup = _.invert(TestCaseStepTypes);

/**
 * Test Case result status
 */
TestResultStatus = {
  staged: 0,
  queued: 1,
  launched: 2,
  executing: 3,
  paused: 4,
  complete: 5,
  skipped: 6
};
TestResultStatusLookup = _.invert(TestResultStatus);

/**
 * Test Case result status
 */
TestResultCodes = {
  fail: 0,
  pass: 1,
  warn: 2,
  abort: 3
};
TestResultCodesLookup = _.invert(TestResultCodes);

/**
 * Types of test run items
 */
TestRunItemTypes = {
  template: 0,
  stage: 1,
  test: 2,
  testGroup: 3
};
TestRunItemTypesLookup = _.invert(TestRunItemTypes);

/**
 * Screenshot Keys
 * This is an enum for the sake of good standard, but it also a little Mickey Mouse
 */
ScreenshotKeys = {
  error: "error",
  loading: "loading",
  afterLoad: "afterLoad",
  afterAction: "afterAction"
};


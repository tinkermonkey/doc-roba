"use strict";

let assert       = require('assert'),
    Future       = require('fibers/future'),
    LogAssistant = require('./classes/log_assistant.js').type('test-role'),
    TestRole     = require('./classes/test_role.js'),
    ServerLink   = require('./classes/server/server_link'),
    RobaContext  = require('./classes/roba_context.js'),
    RobaError    = require("./classes/roba_error.js"),
    commandArgs  = require('minimist')(process.argv.slice(2)),
    roleId       = commandArgs.roleId,
    projectId    = commandArgs.projectId,
    authToken    = commandArgs.token,
    host         = commandArgs.host,
    ddpPort      = commandArgs.ddpPort,
    httpPort     = commandArgs.httpPort,
    logger;

assert(roleId, 'roleId must be specified');
assert(projectId, 'projectId must be specified');
assert(authToken, 'token must be specified');

// Setup the logging
logger = LogAssistant.init(roleId, 'DEBUG');

// A future is required for the DDP interactions we want synchronous
Future.task(function () {
  logger.info('TestResultRole ' + roleId + ' launched');
  let context    = new RobaContext({ testResultRoleId: roleId }),
      serverLink = new ServerLink(projectId, {}, context),
      testRole   = new TestRole(roleId, projectId, serverLink, context, LogAssistant.path);
  
  // Create a ddp connection and connect to the server
  logger.info('Initiating DDP connection');
  serverLink.connect(authToken);
  
  // Have the log assistant wire up a DDP appender to get data to the server quickly
  LogAssistant.addDDP(serverLink, context);
  
  // Initialize the testRole object
  try {
    testRole.init();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to initialize testRole:", error);
    testRole.exit(1, error);
    return;
  }
  
  // Connect to the test agent
  try {
    testRole.connect();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to connect for testRole:", error);
    testRole.exit(1, error);
    return;
  }
  
  // Execute the testRole steps
  try {
    testRole.execute();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to execute testRole steps:", error);
    testRole.exit(1, error);
    return;
  }
  
  // Wrap-up the testRole
  testRole.exit(0);
}).detach();

"use strict";

var assert       = require('assert'),
    Future       = require('fibers/future'),
    TestRole     = require('./classes/test_role.js'),
    ServerLink   = require('./classes/server/server_link'),
    LogAssistant = require('./classes/log_assistant.js'),
    RobaContext  = require('./classes/roba_context.js'),
    commandArgs  = require('minimist')(process.argv.slice(2)),
    roleId       = commandArgs.roleId,
    projectId    = commandArgs.projectId,
    authToken    = commandArgs.token,
    host         = commandArgs.host,
    ddpPort      = commandArgs.ddpPort,
    httpPort     = commandArgs.httpPort,
    assistant, logger;

assert(roleId, 'roleId must be specified');
assert(projectId, 'projectId must be specified');
assert(authToken, 'token must be specified');

// Setup the logging
assistant = new LogAssistant('test_result_role', roleId, 'DEBUG');
logger    = assistant.init();

// A future is required for the DDP interactions we want synchronous
Future.task(function () {
  logger.info('TestResultRole ' + roleId + ' launched');
  let context    = new RobaContext({ testResultRoleId: roleId }),
      serverLink = new ServerLink(projectId, {
        ddp    : {
          host: host,
          port: ddpPort
        }, http: {
          host: host,
          port: httpPort
        }
      }),
      testRole   = new TestRole(roleId, projectId, serverLink, context, assistant.path);
  
  // Create a ddp connection and connect to the server
  logger.info('Initiating DDP connection');
  serverLink.connect(authToken);
  
  // Have the log assistant wire up a DDP appender to get data to the server quickly
  assistant.addDDP(serverLink, context);
  
  // Initialize the testRole object
  try {
    testRole.init();
  } catch (e) {
    logger.error("Failed to initialize testRole:", e.toString(), e.stack);
    testRole.exit(1);
    return;
  }
  
  // Connect to the test agent
  try {
    testRole.connect();
  } catch (e) {
    logger.error("Failed to connect for testRole:", e.toString(), e.stack);
    testRole.exit(1);
    return;
  }
  
  // Execute the testRole steps
  try {
    testRole.execute();
  } catch (e) {
    logger.error("Failed to execute testRole steps:", e.toString(), e.stack);
    testRole.exit(1);
    return;
  }
  
  // Wrap-up the testRole
  testRole.exit(0);
}).detach();

"use strict";

var assert       = require('assert'),
    Future       = require('fibers/future'),
    LogAssistant = require('./classes/log_assistant.js').type('adventure'),
    Adventure    = require('./classes/adventure.js'),
    ServerLink   = require('./classes/server/server_link'),
    RobaContext  = require('./classes/roba_context.js'),
    RobaError    = require("./classes/roba_error.js"),
    commandArgs  = require('minimist')(process.argv.slice(2)),
    adventureId  = commandArgs.adventureId,
    projectId    = commandArgs.projectId,
    authToken    = commandArgs.token,
    host         = commandArgs.host,
    ddpPort      = commandArgs.ddpPort,
    httpPort     = commandArgs.httpPort,
    logger;

assert(adventureId, 'adventureId must be specified');
assert(projectId, 'projectId must be specified');
assert(authToken, 'token must be specified');

// Setup the logging
logger = LogAssistant.init(adventureId, 'DEBUG');

// A future is required for the DDP interactions we want synchronous
Future.task(function () {
  logger.info('Adventure ' + adventureId + ' launched for project ' + projectId);
  let context   = new RobaContext({ adventureId: adventureId }),
      ddpLink   = new ServerLink(projectId, {
        ddp    : {
          host: host,
          port: ddpPort
        }, http: {
          host: host,
          port: httpPort
        }
      }),
      adventure = new Adventure(adventureId, projectId, ddpLink, context, LogAssistant.path);
  
  // Create a ddp connection and connect to the server
  logger.info('Initiating DDP connection');
  ddpLink.connect(authToken);
  
  // Have the log assistant wire up a DDP appender to get data to the server quickly
  LogAssistant.addDDP(ddpLink, context);
  
  // Initialize the adventure object
  try {
    adventure.init();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to initialize adventure:", error);
    adventure.exit(1, error);
    return;
  }
  
  // Connect to the test agent
  try {
    adventure.connect();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to connect for adventure:", error);
    adventure.exit(1, error);
    return;
  }
  
  // Execute the adventure steps
  try {
    adventure.executeSteps();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failed to execute adventure steps:", error);
    adventure.exit(1, error);
    return;
  }
  
  // Wait for commands
  try {
    adventure.waitForCommands();
  } catch (e) {
    let error = new RobaError(e);
    logger.error("Failure in adventure command loop:", error);
    adventure.exit(1, error);
    return;
  }
  
  // Wrap-up the adventure
  adventure.exit(0);
}).detach();

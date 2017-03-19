"use strict";

var assert       = require('assert'),
    Future       = require('fibers/future'),
    Adventure    = require('./classes/adventure.js'),
    ServerLink   = require('./classes/server/server_link'),
    LogAssistant = require('./classes/log_assistant.js'),
    RobaContext  = require('./classes/roba_context.js'),
    commandArgs  = require('minimist')(process.argv.slice(2)),
    adventureId  = commandArgs.adventureId,
    projectId    = commandArgs.projectId,
    authToken    = commandArgs.token,
    host         = commandArgs.host,
    ddpPort      = commandArgs.ddpPort,
    httpPort     = commandArgs.httpPort,
    assistant, logger;

assert(adventureId, 'adventureId must be specified');
assert(projectId, 'projectId must be specified');
assert(authToken, 'token must be specified');

// Setup the logging
assistant = new LogAssistant('adventure', adventureId, 'DEBUG');
logger    = assistant.init();

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
      adventure = new Adventure(adventureId, projectId, ddpLink, context, assistant.path);
  
  // Create a ddp connection and connect to the server
  logger.info('Initiating DDP connection');
  ddpLink.connect(authToken);
  
  // Have the log assistant wire up a DDP appender to get data to the server quickly
  assistant.addDDP(ddpLink, context);
  
  // Initialize the adventure object
  try {
    adventure.init();
  } catch (e) {
    logger.error("Failed to initialize adventure:", e.toString(), e.stack);
    adventure.exit(1);
    return;
  }
  
  // Connect to the test agent
  try {
    adventure.connect();
  } catch (e) {
    logger.error("Failed to connect for adventure:", e.toString(), e.stack);
    adventure.exit(1);
    return;
  }
  
  // Execute the adventure steps
  try {
    adventure.executeSteps();
  } catch (e) {
    logger.error("Failed to execute adventure steps:", e.toString(), e.stack);
    adventure.exit(1);
    return;
  }
  
  // Wait for commands
  try {
    adventure.waitForCommands();
  } catch (e) {
    logger.error("Failure adventure command loop:", e.toString(), e.stack);
    adventure.exit(1);
    return;
  }
  
  // Wrap-up the adventure
  adventure.exit(0);
}).detach();

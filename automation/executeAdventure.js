/**
 *
 * Simple executor for web automation
 *
 */
var Future      = require("fibers/future"),
  fs            = require("fs"),
  assert        = require("assert"),
  log4js        = require("log4js"),
  _             = require("underscore"),
  moment        = require("moment"),
  ddpAppender   = require("./ddp_appender"),
  DDPLink       = require("./ddp_link"),
  FutureDriver  = require("./future_driver"),
  adventureId   = process.argv[2],
  timestamp     = moment().format("YYYY-MM-DD_HH-mm-ss"),
  logger        = log4js.getLogger("runner"),
  logPath       = fs.realpathSync(__dirname + '/..') + '/logs/adventures/' + timestamp + '_' + adventureId + '/',
  logFile       = logPath + 'adventure.log',
  driverEnded   = false,
  endIntentional= false,
  ddpLink, driver, adventure, lastUrl;

/**
 * Status flags for the adventure process
 */
var AdventureStatus = {
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
  },
  AdventureStatusLookup = _.invert(AdventureStatus);

/**
 * Status flags for an adventure or test action
 */
var AdventureStepStatus = {
    staged: 0,
    queued: 1,
    running: 2,
    complete: 3,
    error: 4
  },
  AdventureStepStatusLookup = _.invert(AdventureStepStatus);

// Need an adventure ID to do anything
if(!adventureId){
  throw new Error("No adventureId specified");
  process.exit(1);
}

// make sure the log directory exists
console.log("Log Directory: ", logPath);
if(!fs.existsSync(logPath)){
  var path = "";
  logPath.split("/").forEach(function (piece) {
    if(piece.length){
      path += "/" + piece;
      if(!fs.existsSync(path)){
        console.log("Creating dir: ", path);
        fs.mkdirSync(path);
      }
    }
  });
}

// Get the logging setup
//log4js.clearAppenders();
log4js.loadAppender("file");
logger.setLevel("DEBUG");
logger.debug("Adding log appender: ", logFile);
log4js.addAppender(log4js.appenders.file(logFile));

/**
 * Setup basic signal handling
 */
process.on("SIGINT", function() {
  logger.info("Exiting - SIGINT");
  Exit(0);
});

// Main loop
Future.task(function(){
  try {
    ExecuteAdventure();
  } catch (e) {
    logger.error("Fatal error during adventure execution: ", e);
    logger.error(new Error(e.toString()).trace);
    if(ddpLink){
      ddpLink.setAdventureStatus(adventureId, AdventureStatus.failed)
      Exit(1);
    }
  }
}).detach();

/**
 * Execute an adventure
 * @constructor
 */
function ExecuteAdventure () {
  // Create the ddp link
  logger.info("Adventure " + adventureId + " launched");
  ddpLink = new DDPLink();

  // Connect to the server
  logger.info("Initiating DDP connection");
  ddpLink.connect();

  // Create the ddpLogger
  logger.debug("Creating DDP logger");
  var ddpLogger = ddpAppender.createAppender(ddpLink);
  log4js.addAppender(ddpLogger);

  // load the adventure
  adventure = ddpLink.liveRecord("adventure", adventureId, "adventures");
  ddpAppender.setContext(adventure._id);
  logger.info("Executing Adventure: ", adventure._id);
  logger.info("Log File: ", logFile);
  ddpLink.setAdventureStatus(adventure._id, AdventureStatus.launched);

  // load the test system info
  var testSystem = ddpLink.liveRecord("adventure_test_system", adventure.testSystemId, "test_systems");
  logger.info("Test System Loaded");
  logger.debug("Test System: ", testSystem);

  // load the test agent info
  var testAgent = ddpLink.liveRecord("adventure_test_agent", adventure.testAgentId, "test_agents");
  logger.info("Test Agent Loaded");
  logger.debug("Test Agent: ", testAgent);

  // load the server info
  var server = ddpLink.liveRecord("adventure_server", adventure.serverId, "servers");
  logger.info("Server Loaded");
  logger.debug("Server: ", server);

  // load the adventure actions
  logger.info("Loading Actions");
  var actions = ddpLink.liveList("adventure_actions", [adventure._id]);
  logger.debug("Actions Loaded: ", _.keys(actions).length);

  // load the adventure commands
  logger.info("Loading Commands");
  var commands = ddpLink.liveList("adventure_commands", [adventure._id]);
  logger.debug("Commands Loaded: ", _.keys(commands).length);

  // work out the config
  var config = _.defaults({
    host: testSystem.hostname,
    port: testSystem.port,
    desiredCapabilities: {
      browserName: testAgent.identifier
    },
    end: function (event){
      logger.debug("End event received from driver");
      driverEnded = true;
      if(!endIntentional){
        logger.error("Driver end doesn't look intentional:", event);
        ddpLink.setAdventureStatus(this._id, AdventureStatus.failed);

        // exit
        Exit(1);
      }
    }.bind(adventure)
  }, adventure.config);

  // Setup the driver
  logger.debug("Adventure Test Agent: ", config.desiredCapabilities.browserName);
  logger.debug("Adventure Host: ", config.host);
  logger.trace("Creating FutureDriver: ", config);
  driver = new FutureDriver(config);

  // get the route
  logger.debug("Adventure Route: ", adventure.route);
  var startingStep = adventure.route.steps[0],
    startingUrl = driver.buildUrl(server.url, startingStep.node.url);
  logger.debug("Adventure Starting Point URL: ", startingUrl);

  // Navigate to the starting point
  ddpAppender.setContext(adventure._id, startingStep.node._id, startingStep.stepId);
  logger.trace("Navigating to starting point");
  driver.url(startingUrl);
  logger.debug("Reached starting point");

  // inject the roba_driver helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // set the implicit wait
  logger.trace("Setting driver timeouts");
  driver.timeouts("implicit", 100);
  driver.timeouts("script", 500);
  driver.timeouts("page load", 5000);
  driver.timeoutsImplicitWait(100);
  driver.timeoutsAsyncScript(500);

  // update the steps status' to queued
  logger.trace("Setting steps to queued status");
  _.each(adventure.route.steps, function (step) {
    ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.queued);
  });

  // Save the initial state
  logger.trace("Saving initial state");
  UpdateState();

  // wait for the starting point to load
  ValidateNode(startingStep.node);
  CheckForPause();

  // Run through the actions
  logger.info("Executing Route");
  ddpLink.setAdventureStatus(adventure._id, AdventureStatus.routing);
  var i = 1, step;
  while(i < adventure.route.steps.length && !adventure.abort && !driverEnded){
    // possibly wait for it
    CheckForPause();

    // Get the step and update the context
    step = adventure.route.steps[i];
    logger.info("Executing Route Step " + (i) + " of " + adventure.route.steps.length);
    ddpAppender.setContext(adventure._id, step.node._id, step.stepId);
    logger.info("Step " + i + ": ", step);
    ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.running);

    // take the action
    logger.trace("Executing Action: ", step.action);
    try {
      var result = eval(step.action.code);
    } catch (e) {
      logger.error("Action failed: ", e);
      result = e;
    }

    // store the result
    logger.trace("Action Result: ", result);

    // give it a second
    driver.wait(1000);

    // Validate the destination node
    ValidateNode(step.node);

    // update the state
    UpdateState();

    // done
    ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.complete);

    i++;
  }
  logger.info("All Steps Executed");

  // possibly wait for it
  CheckForPause();

  // Execute any primed commands
  if(commands || adventure.waitForCommands){

    // update the agent state
    UpdateState();

    // update the action status' to queued
    _.each(_.keys(commands), function (commandId) {
      ddpLink.setCommandStatus(commandId, AdventureStepStatus.queued);
    });

    // execute all of the commands which exist now
    logger.info("Executing Preloaded Commands");
    i = 0;
    var command, lastExecuted = Date.now();
    while(i < _.keys(commands).length && !adventure.abort && !driverEnded){
      // possibly wait for it
      CheckForPause();

      command = commands[_.keys(commands)[i]];
      ddpAppender.setContext(adventure._id, adventure.lastKnownNode, command._id);
      logger.trace("Command " + i + ": ", command);

      // execute the command
      ExecuteCommand(command, adventure);

      // update the lastExecuted timestamp
      lastExecuted = Date.now();
      logger.trace("Command Complete");

      i++;
    }

    // If we're supposed to wait around for commands, do that
    if(adventure.waitForCommands && !adventure.abort && !driverEnded){
      logger.info("Entering Command loop");
      ddpLink.setAdventureStatus(adventure._id, AdventureStatus.awaitingCommand);
    }

    var now;
    while(adventure.waitForCommands && !adventure.abort && !driverEnded){
      // Unfortunately we have to do this to pick up the collection if it originally has zero commands
      if(!_.keys(commands).length){
        commands = ddpLink.ddp.collections.adventure_commands;
      }

      // go into a wait loop
      if(i < _.keys(commands).length){
        // possibly wait for it
        CheckForPause();

        ddpLink.setAdventureStatus(adventure._id, AdventureStatus.executingCommand);
        command = commands[_.keys(commands)[i]];
        ddpAppender.setContext(adventure._id, adventure.lastKnownNode, command._id);
        logger.trace("Command " + i + ": ", command);

        // execute the command
        ExecuteCommand(command, adventure);

        // update the lastExecuted timestamp
        lastExecuted = Date.now();
        logger.trace("Command Complete");

        i++;

        if(i >= _.keys(commands).length){
          ddpLink.setAdventureStatus(adventure._id, AdventureStatus.awaitingCommand);
        }
      } else {
        // Keep-alive
        try {
          // keep the wait time low enough to be responsive
          driver.wait(30);

          // Check to see if we should send a keep-alive task to the driver
          now = Date.now();

          //logger.trace("Checking for keepAlive");
          if(now - lastExecuted > 2000){
            logger.trace("checking url: ", lastUrl);
            var url = driver.checkUrl();
            if(url && url !== lastUrl){
              logger.debug("url changed: ", url, lastUrl);
              lastUrl = url;
              UpdateState();
            }

            // check the client logs
            driver.getClientLogs();

            // update the lastExecuted timestamp
            lastExecuted = Date.now();
          }
        } catch (e) {
          logger.error("Exception encountered during keepalive: ", e);
        }
      }
    }
  };

  // Done
  logger.info("Adventure complete");
  ddpLink.setAdventureStatus(adventure._id, AdventureStatus.complete);

  // Exit out
  Exit(0);
}

/**
 * Check for a pause state on the adventure
 * @param adventure
 */
function CheckForPause () {
  logger.debug("CheckForPause: ", adventure.status == AdventureStatus.paused);
  while(adventure.status == AdventureStatus.paused){
    driver.wait(250);
  }
}

/**
 * Execute a single command
 * @param command The command to execute
 */
function ExecuteCommand(command) {
  logger.info("Executing Command: ", command);

  // set the logging context
  ddpLink.setCommandStatus(command._id, AdventureStepStatus.running);
  ddpAppender.setContext(adventure._id, adventure.lastKnownNode, command._id);

  // inject the helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // execute the command
  logger.trace("Executing command: ", command);
  try {
    var result = eval(command.code);
  } catch (e) {
    logger.error("Command failed: ", e);
    result = e;
  }

  // store the result
  logger.trace("Command result: ", result);
  ddpLink.setCommandStatus(command._id, AdventureStepStatus.complete, result);

  // only update the adventure state if the command says to
  if(command.updateState){
    // pause before updating the adventure state
    driver.wait(1000);

    // update the adventure state
    logger.debug("Updating adventure state");
    try {
      UpdateState();
    } catch (e) {
      logger.error("Getting adventure state failed: ", e);
    }
  }
}

/**
 * Wait for a node to load and then validate that it's correct
 * @param node The node object that we should validate
 */
function ValidateNode(node) {
  logger.debug("Validating Node: ", node.title || node._id);
  var valid = true;

  // inject the roba_driver helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // wait for the node to load
  if(node.readyCode){
    logger.debug("Waiting for node to be ready: ", node.readyCode);
    try {
      var result = eval(node.readyCode);
      logger.debug("Ready Code result: ", result);
    } catch (e) {
      logger.error("Ready code failed: ", e);
      result = e;
      valid = false;
    }
  } else {
    logger.debug("Node has no ready code");
  }

  // validate the starting point
  if(node.validationCode){
    logger.debug("Validating node: ", node.validationCode);
    try {
      var result = eval(node.validationCode);
      logger.debug("Validation Code result: ", result);
    } catch (e) {
      logger.error("Validation code failed: ", e);
      result = e;
      valid = false;
    }
  } else {
    logger.debug("Node had no validation code");
  }

  return valid;
}

function UpdateState () {
  var state = driver.getState(logPath);
  lastUrl = state.url;
  ddpLink.saveAdventureState(adventure._id, state);
}

/**
 * Shut everything down
 * @param code
 * @constructor
 */
function Exit(code) {
  // shut down the driver
  try {
    endIntentional = true;
    logger.info("Ending web driver");
    driver.end();
  } catch (e) {}

  // close the ddp link
  try {
    logger.info("Closing DDP Link");
    ddpLink.disconnect();
  } catch (e) {}

  // end the logger
  log4js.shutdown(function(){
    setTimeout(function(){
      process.exit(code);
    }, 2000);
  });
}
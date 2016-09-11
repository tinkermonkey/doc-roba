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
  RobaDriver    = require("./roba_driver"),
  RobaReady     = require("./roba_ready"),
  RobaContext   = require("./roba_context"),
  argv          = require("minimist")(process.argv.slice(2)),
  adventureId   = argv.adventureId,
  singleUseToken  = argv.token,
  timestamp     = moment().format("YYYY-MM-DD_HH-mm-ss"),
  logger        = log4js.getLogger("runner"),
  logPath       = fs.realpathSync(__dirname + '/..') + '/logs/adventures/' + timestamp + '_' + adventureId + '/',
  logFile       = logPath + 'adventure.log',
  driverEnded   = false,
  endIntentional= false,
  ddpLink, driver, adventure, lastUrl, server,
  account, dataContext,
  AdventureStatus, AdventureStepStatus;

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
    logger.error("Fatal error during adventure execution: ", e.toString(), e.stack);
    if(ddpLink){
      ddpLink.setAdventureStatus(adventureId, AdventureStatus ? AdventureStatus.failed : 9);
      Exit(1);
    }
  }
}).detach();

/**
 * Execute an adventure
 * @constructor
 */
function ExecuteAdventure () {
  //create the context
  context = new RobaContext({adventureId: adventureId});

  // Create the ddp link
  logger.info("Adventure " + adventureId + " launched");
  ddpLink = new DDPLink({}, context);

  // Connect to the server
  logger.info("Initiating DDP connection");
  ddpLink.connect(singleUseToken);

  // Create the ddpLogger
  logger.debug("Creating DDP logger");
  var ddpLogger = ddpAppender.createAppender(ddpLink, context);
  log4js.addAppender(ddpLogger);
  logger.info("Log File: ", logFile);

  // load the status enums
  var enums = ddpLink.call("loadAdventureEnums");
  AdventureStatus     = enums.status;
  AdventureStepStatus = enums.stepStatus;

  // load the adventure
  logger.debug("Loading the Adventure live record");
  adventure = ddpLink.liveRecord("adventure", adventureId, "adventures");
  context.update({
    projectId:        adventure.projectId,
    projectVersionId: adventure.projectVersionId,
    testAgentId:      adventure.testAgentId,
    serverId:         adventure.serverId
  });
  ddpLink.setAdventureStatus(adventure._id, AdventureStatus.launched);
  context.milestone({type: "adventure", data: adventure});

  // load the test system info
  var testSystem = ddpLink.liveRecord("adventure_test_system", adventure.testSystemId, "test_systems");
  logger.info("Test System Loaded");
  logger.debug("Test System: ", testSystem);

  // load the test agent info
  var testAgent = ddpLink.liveRecord("adventure_test_agent", adventure.testAgentId, "test_agents");
  logger.info("Test Agent Loaded");
  logger.debug("Test Agent: ", testAgent);

  // load the server info
  server = ddpLink.liveRecord("adventure_server", adventure.serverId, "test_servers");
  logger.info("Server Loaded");
  logger.debug("Server: ", server);

  // load the adventure commands
  logger.info("Loading Commands");
  var commands = ddpLink.liveList("adventure_commands", [adventure._id]);
  logger.debug("Commands Loaded: ", _.keys(commands).length);

  // work out the config
  var config = {
    host: testSystem.hostname,
    port: testSystem.port,
    desiredCapabilities: {
      browserName: testAgent.identifier,
      loggingPrefs: { browser: "ALL", driver: "WARNING", client: "WARNING", server: "WARNING" }
    },
    logLevel: "silent",
    logPath: logPath,
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
  };

  // Setup the driver
  logger.debug("Adventure Test Agent: ", config.desiredCapabilities.browserName);
  logger.debug("Adventure Host: ", config.host);
  logger.trace("Creating RobaDriver: ", config);
  driver = new RobaDriver(config);

  // set the implicit wait
  logger.trace("Setting driver timeouts");
  driver.timeouts("implicit", 100);
  driver.timeouts("script", 5000);
  driver.timeouts("page load", 10000); // don't rely on this, and we don't want it getting in the way
  driver.timeoutsImplicitWait(100);
  driver.timeoutsAsyncScript(20000); // don't rely on this, and we don't want it getting in the way

  // pull out the data context
  dataContext = adventure.dataContext;
  account = dataContext.account;

  // update the step_types status' to queued
  logger.trace("Setting step_types to queued status");
  _.each(adventure.route.steps, function (step) {
    ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.queued);
  });

  // get the route
  context.backup(); //backup the context so we can restore it after each step
  driver.getClientLogs();
  logger.info("Executing Route: ", adventure.route);
  ddpLink.setAdventureStatus(adventure._id, AdventureStatus.routing);
  var i = 0, step, pass = true;
  while(i < adventure.route.steps.length && !adventure.abort && !driverEnded){
    step = adventure.route.steps[i];
    context.restore(); // erase any context from a previous step
    context.update({adventureStepId: step._id}); // each step handler should further update the context
    logger.info("Executing Route Step " + (i + 1) + " of " + adventure.route.steps.length);
    context.milestone({ type: "step", data: step });

    // if we're failing, pause
    if(!pass){
      ddpLink.pauseAdventure(adventureId);
      adventure.status = AdventureStatus.paused;
    }

    // possibly wait for it
    CheckForPause();

    // Execute the step
    try {
      ExecuteStep(step, i);
      pass = true;
    } catch (error) {
      logger.error("Step execution failed: ", error.toString(), error.stack);
      pass = false;
      ddpLink.setAdventureStepStatus(step._id, AdventureStepStatus.error);
    }

    // done
    ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.complete);

    i++;
  }
  context.restore();
  logger.info("All Steps Executed");

  // possibly wait for it
  CheckForPause();

  // Check to see if the command loop is needed
  if(commands || adventure.waitForCommands){
    ddpLink.setAdventureStatus(adventure._id, AdventureStatus.awaitingCommand);
    i = 0;
    var command, lastExecuted = Date.now();
    while(adventure.waitForCommands && !adventure.abort && !driverEnded){
      // We have to do this to pick up the dynamic collection if it originally had zero commands
      if(!_.keys(commands).length){
        commands = ddpLink.ddp.collections.adventure_commands;
      }

      // go into a wait loop
      if(i < _.keys(commands).length){
        command = commands[_.keys(commands)[i]];
        context.update({adventureCommandId: command._id}); // each step handler should further update the context
        logger.trace("Command " + i + ": ", command);
        context.milestone({ type: "command", data: command });

        // possibly wait for it
        CheckForPause();

        ddpLink.setAdventureStatus(adventure._id, AdventureStatus.executingCommand);

        // execute the command
        ExecuteCommand(command, adventure);

        // update the lastExecuted timestamp
        lastExecuted = Date.now();
        logger.trace("Command Complete");

        i++;

        if(i >= _.keys(commands).length){
          ddpLink.setAdventureStatus(adventure._id, AdventureStatus.awaitingCommand);
        }
        context.restore();
      } else {
        // Keep-alive
        try {
          // keep the wait time low enough to be responsive
          driver.wait(30);

          // Check to see if we should send a keep-alive task to the driver
          if(Date.now() - lastExecuted > 2000){
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
          logger.error("Exception encountered during keep-alive: ", e.toString(), e.stack);
        }
      }
    }
  }
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
  logger.trace("CheckForPause: ", adventure.status == AdventureStatus.paused);
  while(adventure.status == AdventureStatus.paused){
    driver.wait(250);
  }
}

/**
 * Execute an adventure step
 * @param step
 * @constructor
 */
function ExecuteStep (step, stepNum) {
  logger.info("MILESTONE", {context: {type: "step", step: step}});
  logger.debug("Step " + stepNum + ": ", step);
  ddpLink.setAdventureStepStatus(step.stepId, AdventureStepStatus.running);

  // first step needs to be navigated manually
  if(stepNum == 0){
    var startingUrl = driver.buildUrl(server.url, step.node.url);
    logger.trace("Navigating to starting point: ", startingUrl);
    driver.url(startingUrl);
    logger.debug("Reached starting point: ", startingUrl);

    // give it a sec
    driver.wait(1000);
  }

  // inject the helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // update the state
  UpdateState();

  // Validate the current node
  var validationResult = ValidateNode(step.node);

  // Save the validation results
  if(validationResult.readyChecker){
    _.each(validationResult.readyChecker.checks, function (check) {
      ddpLink.saveAdventureStepResult(step.stepId, "ready", check)
    });
  }

  // update the state
  UpdateState();

  // take the action
  if(step.action){
    logger.debug("Executing Action: ", step.action);

    // setup the action variables
    var variableCode = "",
      debugCode = "";
    _.each(step.action.variables, function (variable) {
      if(dataContext["step" + stepNum]){
        variableCode += "var " + variable.name + " = dataContext.step" + stepNum + "." + variable.name + " || " + variable.defaultValue + ";\n";
      } else {
        variableCode += "var " + variable.name + " = " + variable.defaultValue + ";\n";
      }
      debugCode += "logger.debug(\"Variable " + variable.name + ":\", " + variable.name + ");\n"
    });
    logger.debug("Action Variable Code: ", variableCode);
    try {
      var result = eval(variableCode + debugCode + step.action.code);
    } catch (e) {
      logger.error("Action failed: ", e.toString(), e.stack);
      result = e.toString();
    }

    // store the result
    logger.debug("Action Result: ", result);
  } else if(stepNum !== adventure.route.steps.length - 1){
    logger.error("Dead end step: ", step);
    throw new Error("Dead end step encountered: ", step);
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

  // inject the helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // execute the command
  logger.trace("Executing command: ", command);
  try {
    var result = eval(command.code);
  } catch (e) {
    logger.error("Command failed: ", e.toString(), e.stack);
    result = e.toString();
  }

  // store the result
  logger.info("Command result: ", result);
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
      logger.error("Getting adventure state failed: ", e.toString(), e.stack);
    }
  }
}

/**
 * Wait for a node to load and then validate that it's correct
 * @param node The node object that we should validate
 */
function ValidateNode(node) {
  logger.debug("Validating Node: ", node.title || node._id);
  var result = {
    ready: true,
    valid: true
  };

  // inject the roba_driver helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();

  // wait for the node to load
  if(node.readyCode){
    var ready = new RobaReady(driver);
    logger.debug("Waiting for node to be ready: ", node.readyCode);
    try {
      eval(node.readyCode);
      result.readyResult = ready.check();
      logger.debug("Ready Code result: ", result.readyResult);
    } catch (e) {
      logger.error("Ready code failed: ", e.toString(), e.stack);
      result.readyResult = e.toString();
      result.ready = false;
    }
    result.reachChecker = ready;
  } else {
    logger.debug("Node has no ready code");
  }

  // validate the starting point
  if(node.validationCode){
    logger.debug("Validating node: ", node.validationCode);
    try {
      result.validResult = eval(node.validationCode);
      logger.debug("Validation Code result: ", result.validResult);
    } catch (e) {
      logger.error("Validation code failed: ", e.toString(), e.stack);
      result.validResult = e.toString();
      result.valid = false;
    }
  } else {
    logger.debug("Node had no validation code");
  }

  return result;
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
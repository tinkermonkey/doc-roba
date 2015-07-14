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
  testRoleResultId   = process.argv[2],
  timestamp     = moment().format("YYYY-MM-DD_HH-mm-ss"),
  logger        = log4js.getLogger("test_role"),
  logPath       = fs.realpathSync(__dirname + '/..') + '/logs/test_role_results/' + timestamp + '_' + testRoleResultId + '/',
  logFile       = logPath + 'role_result.log',
  driverEnded   = false,
  endIntentional= false,
  ddpLink, driver,
  server, account,
  test, resultLink,
  TestResultStatus, TestResultCodes, TestCaseStepTypes;

// Need an adventure ID to do anything
if(!testRoleResultId){
  throw new Error("No testRoleResultId specified");
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
    ExecuteTestRole();
  } catch (e) {
    logger.error("Fatal error during test role execution: ", e);
    logger.error(new Error(e.toString()).trace);
    if(ddpLink){
      ddpLink.setTestRoleResultStatus(testRoleResultId, 0);
      Exit(1);
    }
  }
}).detach();

/**
 * Execute a test case role
 * @constructor
 */
function ExecuteTestRole () {
  // Create the ddp link
  logger.info("TestRole " + testRoleResultId + " launched");
  ddpLink = new DDPLink();

  // Connect to the server
  logger.info("Initiating DDP connection");
  ddpLink.connect();

  // Create the ddpLogger
  logger.debug("Creating DDP logger");
  var ddpLogger = ddpAppender.createAppender(ddpLink);
  log4js.addAppender(ddpLogger);

  // load the status enum
  var enums = ddpLink.call("loadTestEnums");
  TestResultStatus  = enums.resultStatus;
  TestResultCodes   = enums.resultCodes;
  TestCaseStepTypes = enums.stepTypes;

  // load the data bundle
  logger.debug("Loading the TestRole Manifest");
  test = ddpLink.call("loadTestRoleManifest", [testRoleResultId]);
  ddpLink.setTestRoleResultStatus(test.role._id, TestResultStatus.launched);
  
  ddpAppender.setContext(test.result._id, test.role._id);
  logger.info("MILESTONE", { type: "test_role_result", data: test.role });
  logger.debug("Executing Test Result Role: ", test.role._id);
  logger.info("Log File: ", logFile);

  // load a live record so that we can know when to abort
  resultLink = ddpLink.liveRecord("test_result", test.result._id, "test_results");
  
  // work out the config
  var config = {
    host: test.system.hostname,
    port: test.system.port,
    desiredCapabilities: {
      browserName: test.agent.identifier,
      loggingPrefs: { browser: "ALL", driver: "WARNING", client: "WARNING", server: "WARNING" }
    },
    logLevel: "silent",
    end: function (event){
      logger.debug("End event received from driver");
      driverEnded = true;
      if(!endIntentional){
        logger.error("Driver end doesn't look intentional:", event);
        ddpLink.setTestRoleResultStatus(this._id, TestResultStatus.failed);

        // exit
        Exit(1);
      }
    }.bind(test.role)
  };

  // Setup the driver
  logger.debug("Test Agent: ", config.desiredCapabilities.browserName);
  logger.debug("Test Host: ", config.host);
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
  account = test.role.dataContext.account;

  // update the steps status' to queued
  logger.trace("Setting steps to queued status");
  _.each(test.steps, function (step) {
    ddpLink.set(step.stepId, TestResultStatus.queued);
  });

  // get the route
  driver.getClientLogs();
  ddpLink.setTestRoleResultStatus(test.role._id, TestResultStatus.executing);
  var i = 0, step, pass = false;
  while(i < test.steps.length && !resultLink.abort && !driverEnded && pass){
    step = test.steps[i];

    // if the role is failed, skip over the rest of the steps
    if(!pass){
      ddpLink.setTestStepResultStatus(step._id, TestResultStatus.skipped);
      i++;
      continue;
    }

    ddpLink.setTestStepResultStatus(step._id, TestResultStatus.launched);
    logger.info("Executing Test Step " + (i) + " of " + test.steps.length);
    logger.info("MILESTONE", { type: "step", data: step });

    // Execute the step
    try{
      switch(step.type){
        case TestCaseStepTypes.node:
          pass = ExecuteNodeStep(step);
          break;
        case TestCaseStepTypes.action:
          pass = ExecuteActionStep(step);
          break;
        case TestCaseStepTypes.navigate:
          pass = ExecuteNavigationStep(step);
          break;
        case TestCaseStepTypes.wait:
          pass = ExecuteWaitStep(step);
          break;
        case TestCaseStepTypes.custom:
          pass = ExecuteCustomStep(step);
          break;
        default:
          throw new Error("Test Role Execution failed: Unknown step type [" + step.type + "]");
      }
      // done
      ddpLink.setTestStepResultStatus(step._id, TestResultStatus.complete);
    } catch (error) {
      pass = false;
      ddpLink.setTestStepResultStatus(step._id, TestResultStatus.error);
      ddpLink.setTestStepResultCode(step._id, TestResultCodes.fail);
    }

    logger.info("MILESTONE-END", { type: "step" });

    i++;
  }
  logger.info("All Steps Executed");
  ddpLink.setTestRoleResultStatus(test.role._id, TestResultStatus.complete);
  ddpLink.setTestRoleResultCode(test.role._id, pass ? TestResultCodes.pass : TestResultCodes.fail);

  logger.info("MILESTONE-END", { type: "test_step_role" });

  // Exit out
  Exit(0);
}

/**
 * Execute a Node step
 * @param step
 */
function ExecuteNodeStep (step) {
  ddpLink.setTestStepResultStatus(step._id, TestResultStatus.executing);

  // set the milestone in the log
  logger.info("MILESTONE", { type: "node", data: step.data.node });

  // first step needs to be navigated manually
  if(step.order == 0){
    var startingUrl = driver.buildUrl(server.url, step.data.node.url);
    logger.trace("Navigating to starting point: ", startingUrl);
    driver.url(startingUrl);
    logger.debug("Reached starting point: ", startingUrl);
  }

  // Validate the current node
  var result = ValidateNode(step.data.node),
    pass = result.isReady && result.isValid;
  logger.info("MILESTONE-END", { type: "node" });

  // Save the validation checks
  ddpLink.saveTestStepResultChecks(step._id, result.checks);

  // Set the result code
  ddpLink.setTestStepResultCode(step._id, pass ? TestResultCodes.pass : TestResultCodes.fail);
  return pass;
}

/**
 * Execute an Action step
 * @param step
 */
function ExecuteActionStep (step) {
  ddpLink.setTestStepResultStatus(step._id, TestResultStatus.executing);

  // take the action
  var pass = true,
    result = {},
    actionResult, actionError;
  logger.info("MILESTONE", { type: "action", data: { action: step.data.action, context: step.data.context } });
  try{
    actionResult = TakeAction(step.data.action, step.data.context);
  } catch(error) {
    logger.error("Action execution failed: ", error.toString);
    actionError = error.toString();
    pass = false;
  }
  logger.info("MILESTONE-END", { type: "action" });

  if(pass){
    logger.info("MILESTONE", { type: "node", data: step.data.node });

    // Validate the current node
    result = ValidateNode(step.data.node);
    pass = result.isReady && result.isValid;
    logger.info("MILESTONE-END", { type: "node" });
  }

  // Save the validation checks
  ddpLink.saveTestStepResultChecks(step._id, result.checks);

  // Set the result code
  ddpLink.setTestStepResultCode(step._id, pass ? TestResultCodes.pass : TestResultCodes.fail);
  return pass;
}

/**
 * Execute a Navigation step, basically a small adventure
 * @param step
 */
function ExecuteNavigationStep (step) {
  ddpLink.setTestStepResultStatus(step._id, TestResultStatus.executing);

  // fetch the route from the server
  var route = ddpLink.call("loadNavigationRoute", [step.data.destination, step.data.source]);
  logger.info("MILESTONE", { type: "route", data: route });

  // Execute the route steps, but skip the last one because another step will validate that
  var i = 0, pass = true, routeStep, checks = [];
  while(i < route.steps.length - 1 && !resultLink.abort && !driverEnded && pass ){
    var actionExecuted = false, result = {},
      actionError, actionResult;

    routeStep = route.steps[i];

    // first step needs to be navigated manually if this is the first test step
    if(i == 0 && step.order == 0){
      logger.info("MILESTONE", { type: "node", data: routeStep.node });
      var startingUrl = driver.buildUrl(server.url, routeStep.node.url);
      logger.trace("Navigating to starting point: ", startingUrl);
      driver.url(startingUrl);
      logger.debug("Reached starting point: ", startingUrl);
    }

    // validate the node if this is the first for the test, or the nth for the route
    if((i == 0 && step.order == 0) || i > 0) {
      // Validate the node we just landed on
      result = ValidateNode(step.data.node);
      pass = result.isReady && result.isValid;
      logger.info("MILESTONE-END", { type: "node" });
    }

    // take the action
    if(pass){
      logger.info("MILESTONE", { type: "action", data: { action: routeStep.action, context: step.data.context } });
      actionExecuted = true;
      try {
        actionResult = TakeAction(routeStep.action, routeStep.context);
      } catch(error){
        pass = false;
        actionError = error.toString();
      }
      logger.info("MILESTONE-END", { type: "action" });
    }

    // store the route and the checks
    checks.push({
      order: i,
      pass: pass,
      routeStep: routeStep,
      checks: result.checks,
      actionExecuted: actionExecuted,
      actionResult: actionResult,
      actionError: actionError
    });
  }
  logger.info("MILESTONE-END", { type: "route" });

  // Save the validation checks
  ddpLink.saveTestStepResultChecks(step._id, checks);

  // Set the result code
  ddpLink.setTestStepResultCode(step._id, pass ? TestResultCodes.pass : TestResultCodes.fail);
  return pass;
}

/**
 * Execute a Wait step
 * @param step
 */
function ExecuteWaitStep (step) {

}

/**
 * Execute a Custom step
 * @param step
 */
function ExecuteCustomStep (step) {

}

/**
 * Take an action
 * @param action The action to execute
 * @param context The context from which to pull variable values
 */
function TakeAction(action, context) {
  // take the action
  logger.debug("Executing Action: ", action);

  // setup the action variables
  var variableCode = "",
    debugCode = "",
    result = {};

  // assemble some context code
  _.each(action.variables, function (variable) {
    if(context){
      variableCode += "var " + variable.name + " = context." + variable.name + " || " + variable.defaultValue + ";\n";
    } else {
      variableCode += "var " + variable.name + " = " + variable.defaultValue + ";\n";
    }
    debugCode += "logger.debug(\"Variable " + variable.name + ":\", " + variable.name + ");\n"
  });

  // try the action
  logger.debug("Action Variable Code: ", variableCode);
  try {
    result.value = eval(variableCode + debugCode + action.code);
  } catch (error) {
    logger.error("Action failed: ", error.toString());
    result.error = error.toString();
  }

  return result;
}

/**
 * Wait for a node to load and then validate that it's correct
 * @param node The node object that we should validate
 */
function ValidateNode(node) {
  logger.debug("Validating Node: ", node.title || node._id);
  var result = {
    isReady: true,
    isValid: true,
    checks: {
      ready: {},
      validation: {}
    }
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
      result.isReady = ready.check();
      logger.debug("Ready Code result: ", result.isReady);
    } catch (e) {
      logger.error("Ready code failed: ", e.toString());
      result.checks.ready.error = e.toString();
      result.isReady = false;
    }
    result.checks.ready.checks = ready.checks;
  } else {
    logger.debug("Node has no ready code");
  }

  // validate the starting point
  if(node.validationCode){
    logger.debug("Validating node: ", node.isValid);
    try {
      result.isValid = eval(node.validationCode);
      logger.debug("Validation Code result: ", result.isValid);
    } catch (e) {
      logger.error("Validation code failed: ", e.toString());
      result.checks.validation.error = e.toString();
      result.isValid = false;
    }
    //result.checks.validation.checks = ready.checks;
  } else {
    logger.debug("Node had no validation code");
  }

  return result;
}

/**
 * Shut everything down
 * @param code
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
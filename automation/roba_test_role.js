/**
 *
 * Simple executor for web automation
 *
 */
var Future           = require("fibers/future"),
    fs               = require("fs"),
    assert           = require("assert"),
    log4js           = require("log4js"),
    _                = require("underscore"),
    moment           = require("moment"),
    ddpAppender      = require("./ddp_appender"),
    DDPLink          = require("./ddp_link"),
    RobaDriver       = require("./roba_driver"),
    RobaError        = require("./roba_error"),
    RobaReady        = require("./roba_ready"),
    RobaValid        = require("./roba_valid"),
    RobaContext      = require("./roba_context"),
    argv             = require("minimist")(process.argv.slice(2)),
    testResultRoleId = argv.roleId,
    singleUseToken   = argv.token,
    timestamp        = moment().format("YYYY-MM-DD_HH-mm-ss"),
    logger           = log4js.getLogger("test_role"),
    logPath          = fs.realpathSync(__dirname + '/..') + '/logs/test_result_roles/' + timestamp + '_' + testResultRoleId + '/',
    logFile          = logPath + 'role_result.log',
    driverEnded      = false,
    endIntentional   = false,
    ddpLink, driver, context,
    server, account,
    test, resultLink,
    TestResultStatus, TestResultCodes, TestCaseStepTypes, ScreenshotKeys;

// Need a testResultRoleId to do anything
//console.log("roba_test_role arguments: ", argv);
//console.log("roba_test_role raw: ", process.argv);
if (!testResultRoleId) {
  throw new Error("No roleId specified");
  process.exit(1);
} else if (!singleUseToken) {
  throw new Error("No token specified");
  process.exit(1);
}

// make sure the log directory exists
console.log("Log Directory: ", logPath);
if (!fs.existsSync(logPath)) {
  var path = "";
  logPath.split("/").forEach(function (piece) {
    if (piece.length) {
      path += "/" + piece;
      if (!fs.existsSync(path)) {
        console.log("Creating dir: ", path);
        fs.mkdirSync(path);
      }
    }
  });
}

// Get the logging setup
//log4js.clearAppenders();
log4js.loadAppender("file");
logger.setLevel("TRACE");
logger.debug("Adding log appender: ", logFile);
log4js.addAppender(log4js.appenders.file(logFile));

/**
 * Setup basic signal handling
 */
process.on("SIGINT", function () {
  logger.info("Exiting - SIGINT");
  Exit(0);
});

// Main loop
Future.task(function () {
  try {
    ExecuteTestRole();
  } catch (e) {
    logger.error("Fatal error during test role execution: ", e.toString(), e.stack);
    if (ddpLink) {
      var error = new RobaError(e);
      logger.info("Signaling test role failure", error);
      ddpLink.testRoleFailed(testResultRoleId, { error: error });
      Exit(1);
    }
  }
}).detach();

/**
 * Execute a test case role
 * @constructor
 */
function ExecuteTestRole () {
  //create the context
  context = new RobaContext({ testResultRoleId: testResultRoleId });
  
  // Create the ddp link
  logger.info("TestRole " + testResultRoleId + " launched");
  ddpLink = new DDPLink({}, context);
  
  // Connect to the server
  logger.info("Initiating DDP connection");
  ddpLink.connect(singleUseToken);
  
  // Create the ddpLogger
  logger.debug("Creating DDP logger");
  var ddpLogger = ddpAppender.createAppender(ddpLink, context);
  log4js.addAppender(ddpLogger);
  logger.info("Log File: ", logFile);
  
  // load the status enum
  var enums         = ddpLink.call("loadTestEnums");
  TestResultStatus  = enums.resultStatus;
  TestResultCodes   = enums.resultCodes;
  TestCaseStepTypes = enums.stepTypes;
  ScreenshotKeys    = enums.screenshotKeys;
  logger.trace("enums: ", enums);
  
  // load the data bundle
  logger.debug("Loading the TestRole Manifest");
  test = ddpLink.call("loadTestRoleManifest", [ testResultRoleId ]);
  logger.trace("Manifest: ", test);
  context.update({
    projectId       : test.role.projectId,
    projectVersionId: test.role.projectVersionId,
    testAgentId     : test.agent.staticId,
    serverId        : test.server.staticId,
    testRunId       : test.role.testRunId,
    testResultId    : test.role.testResultId
  });
  ddpLink.setTestResultRoleStatus(test.role._id, TestResultStatus.executing);
  context.milestone({ type: "test_result_role", data: test.role });
  
  // load a live record so that we can know when to abort
  resultLink = ddpLink.liveRecord("test_run_result", test.result._id, "test_results");
  
  // work out the config
  var config = {
    host               : test.system.hostname,
    port               : test.system.port,
    desiredCapabilities: {
      browserName : test.agent.identifier,
      loggingPrefs: { browser: "ALL", driver: "WARNING", client: "WARNING", server: "WARNING" }
    },
    logLevel           : "silent",
    logPath            : logPath,
    end                : function (event) {
      logger.debug("End event received from driver");
      driverEnded = true;
      if (!endIntentional) {
        logger.error("Driver end doesn't look intentional:", event);
        ddpLink.setTestResultRoleStatus(this._id, TestResultStatus.failed);
        
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
  server  = test.server;
  logger.debug("Account:", account);
  
  // update the step_types status' to queued
  logger.trace("Setting step_types to queued status");
  _.each(test.steps, function (step) {
    ddpLink.setTestResultStepStatus(step._id, TestResultStatus.queued);
  });
  
  // get the route
  context.backup(); //backup the context so we can restore it after each step
  driver.getClientLogs();
  ddpLink.setTestResultRoleStatus(test.role._id, TestResultStatus.executing);
  var i = 0, step, pass = true;
  while (i < test.steps.length && !resultLink.abort && !driverEnded && pass) {
    step = test.steps[ i ];
    context.restore(); // erase any context from a previous step
    context.update({ testResultStepId: step._id }); // each step handler should further update the context
    
    // if the role is failed, skip over the rest of the step_types
    if (!pass) {
      ddpLink.setTestResultStepStatus(step._id, TestResultStatus.skipped);
      i++;
      continue;
    }
    
    ddpLink.setTestResultStepStatus(step._id, TestResultStatus.launched);
    logger.info("Executing Test Step " + (i + 1) + " of " + test.steps.length);
    context.milestone({ type: "step", data: step });
    
    // Execute the step
    try {
      var error;
      switch (step.type) {
        case TestCaseStepTypes.node:
          error = ExecuteNodeStep(step);
          break;
        case TestCaseStepTypes.action:
          error = ExecuteActionStep(step);
          break;
        case TestCaseStepTypes.navigate:
          error = ExecuteNavigationStep(step);
          break;
        case TestCaseStepTypes.wait:
          error = ExecuteWaitStep(step);
          break;
        case TestCaseStepTypes.custom:
          error = ExecuteCustomStep(step);
          break;
        default:
          throw new Error("test-step-failure", "Test Role Execution failed: Unknown step type [" + step.type + "]", step);
      }
      // done
      ddpLink.setTestResultStepStatus(step._id, TestResultStatus.complete);
      if (error) {
        logger.error("Step execution returned an error: ", error);
        pass = false;
        ddpLink.setTestResultStepResult(step._id, TestResultCodes.fail, { error: error });
        ddpLink.setTestResultRoleResult(testResultRoleId, TestResultCodes.fail, { error: error });
      } else {
        ddpLink.setTestResultStepResult(step._id, TestResultCodes.pass);
      }
    } catch (e) {
      var error = new RobaError(e);
      logger.error("Step execution failed: ", error);
      pass = false;
      ddpLink.setTestResultStepStatus(step._id, TestResultStatus.complete);
      ddpLink.setTestResultStepResult(step._id, TestResultCodes.fail, { error: error });
    }
    
    i++;
  }
  context.restore();
  logger.info("All Steps Executed");
  
  if (i !== test.steps.length || !pass || resultLink.abort || driverEnded) {
    logger.debug("Main Loop Criteria: ", {
      i          : i,
      stepCount  : test.steps.length,
      abort      : resultLink.abort,
      driverEnded: driverEnded,
      pass       : pass
    });
  }
  
  ddpLink.setTestResultRoleStatus(test.role._id, TestResultStatus.complete);
  if (pass) {
    ddpLink.setTestResultRoleResult(test.role._id, TestResultCodes.pass);
  }
  
  // Exit out
  Exit(0);
}

/**
 * Execute a Node step
 * @param step
 */
function ExecuteNodeStep (step) {
  logger.debug("Executing node step: ", step.order);
  ddpLink.setTestResultStepStatus(step._id, TestResultStatus.executing);
  var error;
  
  // Update the context
  context.update({ nodeId: step.data.node.staticId });
  context.milestone({ type: "node", data: step.data.node });
  
  // first step needs to be navigated manually
  if (step.order == 0) {
    logger.debug("This is step 0, building URL from components: ", server.url, step.data.node.url);
    var startingUrl = driver.buildUrl(server.url, step.data.node.url);
    logger.debug("Navigating to starting point: ", startingUrl);
    driver.url(startingUrl);
    logger.debug("Reached starting point");
  }
  
  // Validate the current node
  var result = ValidateNode(step.data.node);
  
  // Check the result
  context.update({ pass: result.isReady && result.isValid });
  
  // save a screenshot of the page
  ddpLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
  
  // Save the validation checks
  ddpLink.saveTestResultStepChecks(step._id, [ result.checks ]);
  
  return error;
}

/**
 * Execute an Action step
 * @param step
 */
function ExecuteActionStep (step) {
  ddpLink.setTestResultStepStatus(step._id, TestResultStatus.executing);
  
  // Update the context
  context.update({ actionId: step.data.action.staticId });
  context.milestone({ type: "action", data: { action: step.data.action, context: step.data.context } });
  
  // take the action
  var pass   = true,
      result = {}, error;
  try {
    TakeAction(step.data.action, step.data.context);
    //if(actionResult.error){
    //  error = actionResult.error;
    //  pass = false;
    // }
  } catch (e) {
    error = new RobaError(e);
    logger.error("Action execution failed: ", error);
    pass = false;
  }
  
  // update the context and grab a screenshot
  context.update({ pass: pass });
  ddpLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterAction);
  
  if (pass) {
    // Update the context
    context.update({ nodeId: step.data.node.staticId });
    context.milestone({ type: "node", data: step.data.node });
    
    // Validate the current node
    result = ValidateNode(step.data.node);
    pass   = result.isReady && result.isValid && !result.error;
    context.update({ pass: pass });
    if (result.error) {
      error = result.error;
    }
    
    // save a screenshot
    ddpLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
  }
  
  // Save the validation checks
  // TODO: splice together the action result & checks
  ddpLink.saveTestResultStepChecks(step._id, [ result.checks ]);
  
  return error;
}

/**
 * Execute a Navigation step, basically a small adventure
 * @param step
 */
function ExecuteNavigationStep (step) {
  ddpLink.setTestResultStepStatus(step._id, TestResultStatus.executing);
  
  // fetch the route from the server
  var route = ddpLink.call("loadNavigationRoute", [ step.data.destinationId, step.data.sourceId, step.projectVersionId ]);
  
  // Update the context
  context.milestone({ type: "route", data: route });
  
  // Execute the route step_types, but skip the last one because another step will validate that
  var i = 0, pass = true, routeStep, checks = [], error;
  while (i < route.steps.length - 1 && !resultLink.abort && !driverEnded && pass) {
    var actionExecuted = false, result = {};
    
    routeStep = route.steps[ i ];
    
    // first step needs to be navigated manually if this is the first test step
    if (i == 0 && step.order == 0) {
      var startingUrl = driver.buildUrl(server.url, routeStep.node.url);
      logger.trace("Navigating to starting point: ", startingUrl);
      driver.url(startingUrl);
      logger.debug("Reached starting point: ", startingUrl);
    }
    
    // validate the node if this is the first for the test, or the nth for the route
    if ((i == 0 && step.order == 0) || i > 0) {
      // update the context
      context.update({ nodeId: routeStep.node.staticId });
      context.milestone({ type: "node", data: routeStep.node });
      
      // Validate the node we just landed on
      result = ValidateNode(routeStep.node);
      pass   = result.isReady && result.isValid && !result.error;
      context.update({ pass: pass });
      if (result.error) {
        error = result.error;
      }
      
      // save a screenshot of the page
      ddpLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterLoad);
    }
    
    // take the action
    if (pass) {
      context.update({ actionId: routeStep.action.staticId });
      context.milestone({ type: "action", data: { action: routeStep.action, context: step.data.context } });
      actionExecuted = true;
      try {
        TakeAction(routeStep.action, routeStep.context);
        //if(actionResult.error){
        //  error = actionResult.error;
        //  pass = false;
        //}
      } catch (e) {
        error = new RobaError(e);
        logger.error("Action failed: ", error);
        pass = false;
      }
      
      // update the context and grab a screenshot
      context.update({ pass: pass });
      ddpLink.saveImage(driver.getScreenshot(), ScreenshotKeys.afterAction);
    }
    
    // store the route and the checks
    checks.push({
      order         : i,
      pass          : pass,
      routeStep     : routeStep,
      checks        : result.checks,
      actionExecuted: actionExecuted,
      error         : error
    });
    
    i++;
  }
  
  // Save the validation checks
  ddpLink.saveTestResultStepChecks(step._id, checks);
  
  return error;
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
function TakeAction (action, context) {
  // take the action
  logger.debug("Executing Action: ", action);
  
  // setup the action variables
  var variableCode = "",
      debugCode    = "",
      result       = {};
  
  // assemble some context code
  _.each(action.variables, function (variable) {
    if (context) {
      variableCode += "var " + variable.name + " = context." + variable.name + " || " + variable.defaultValue + ";\n";
    } else {
      variableCode += "var " + variable.name + " = " + variable.defaultValue + ";\n";
    }
    debugCode += "logger.debug(\"Variable " + variable.name + ":\", " + variable.name + ");\n"
  });
  
  // try the action
  logger.debug("Action Variable Code: ", variableCode);
  result.value = eval(variableCode + debugCode + action.code);
  
  return result;
}

/**
 * Wait for a node to load and then validate that it's correct
 * @param node The node object that we should validate
 */
function ValidateNode (node) {
  logger.debug("Validating Node: ", node.title || node._id);
  var result = {
    isReady: true,
    isValid: true,
    checks : {
      node      : node,
      ready     : {},
      validation: {}
    }
  };
  
  // inject the roba_driver helpers
  logger.trace("Injecting browser-side driver helpers");
  driver.injectHelpers();
  
  // wait for the node to load
  if (node.readyCode) {
    var ready = new RobaReady(driver);
    logger.debug("Waiting for node to be ready: ", node.readyCode);
    try {
      eval(node.readyCode);
      result.isReady = ready.check();
      logger.debug("Ready Code result: ", result.isReady);
    } catch (e) {
      result.checks.ready.error = new RobaError(e);
      result.error              = result.checks.ready.error;
      logger.error("Ready code failed: ", result.checks.ready.error);
      result.isReady = false;
    }
    result.checks.ready.checks = ready.checks;
    
    // if it's not ready and there's no error, that's an error
    if (!result.isReady && !result.error) {
      logger.error("Ready check failed: ", { node: node, checks: ready.checks });
      result.error = new RobaError(new Error("node-not-ready"));
    }
  } else {
    logger.debug("Node has no ready code");
  }
  
  // validate the starting point
  if (node.validationCode && result.isReady) {
    var valid = new RobaValid(driver);
    logger.debug("Validating node: ", node.isValid);
    try {
      eval(node.validationCode);
      result.isValid = valid.check();
      logger.debug("Validation Code result: ", result.isValid);
    } catch (e) {
      result.checks.validation.error = new RobaError(e);
      if (!result.error) {
        result.error = result.checks.validation.error;
      }
      logger.error("Validation code failed: ", result.checks.validation.error);
      result.isValid = false;
    }
    result.checks.validation.checks = valid.checks;
    
    // if it's not valid and there's no error, that's an error
    if (!result.isValid && !result.error) {
      logger.error("Validation failed: ", { node: node, checks: valid.checks });
      result.error = new RobaError(new Error("node-not-valid"));
    }
  } else {
    logger.debug("Node had no validation code");
  }
  
  return result;
}

/**
 * Shut everything down
 * @param code
 */
function Exit (code) {
  // shut down the driver
  try {
    endIntentional = true;
    logger.info("Ending web driver");
    driver.end();
  } catch (e) {
  }
  
  // close the ddp link
  try {
    logger.info("Closing DDP Link");
    ddpLink.disconnect();
  } catch (e) {
  }
  
  // end the logger
  log4js.shutdown(function () {
    setTimeout(function () {
      process.exit(code);
    }, 2000);
  });
}
"use strict";

let _                    = require('underscore'),
    assert               = require('assert'),
    log4js               = require('log4js'),
    logger               = log4js.getLogger('test_result_role'),
    RobaDriver           = require('./driver/roba_driver.js'),
    TestRoleNodeStep     = require('./test_role_step/test_role_step_node.js'),
    TestRoleActionStep   = require('./test_role_step/test_role_step_action.js'),
    TestRoleNavigateStep = require('./test_role_step/test_role_step_navigate.js'),
    TestRoleWaitStep     = require('./test_role_step/test_role_step_wait.js'),
    TestRoleCustomStep   = require('./test_role_step/test_role_step_custom.js'),
    NodeCheckTypes       = require('./enum/node_check_types.js'),
    ScreenshotKeys       = require('./enum/screenshot_keys.js'),
    TestCaseStepTypes    = require('./enum/test_case_step_types.js'),
    TestResultStatus     = require('./enum/test_result_status.js'),
    TestResultCodes      = require('./enum/test_result_codes.js');

logger.setLevel('DEBUG');

class TestRole {
  /**
   * TestRole
   * @param roleId String
   * @param projectId String
   * @param serverLink ServerLink
   * @param context RobaContext
   * @param logPath The path the folder to save images in
   */
  constructor (roleId, projectId, serverLink, context, logPath) {
    logger.debug('Creating TestRole:', roleId, projectId, logPath);
    this._id        = roleId;
    this.projectId  = projectId;
    this.serverLink = serverLink;
    this.context    = context;
    this.logPath    = logPath;
  }
  
  /**
   * Initialize the test role
   */
  init () {
    logger.debug('TestRole.init:', this._id);
    let self = this;
    
    // Setup a listener to exit gracefully on sigint
    process.on("SIGINT", function () {
      logger.info("Exiting - SIGINT");
      self.exit(0);
    });
    
    // Load the enums needed for an testRole
    self.loadEnums();
    
    // Load the test role manifest
    self.loadTestRoleManifest();
    
    // Update the status to launched
    self.setStatus(TestResultStatus.launched);
    
    // Load a live link TestResult record to check for abort signals
    self.loadTestResultRecord();
    
    // Create and initialize the test steps
    self.steps = self.testResultSteps.map((testResultStep, index) => {
      logger.debug('TestRole.init creating test role step:', index, testResultStep);
      let step;
      switch (testResultStep.type) {
        case TestCaseStepTypes.node:
          step = new TestRoleNodeStep(testResultStep, index, self);
          break;
        case TestCaseStepTypes.action:
          step = new TestRoleActionStep(testResultStep, index, self);
          break;
        case TestCaseStepTypes.navigate:
          step = new TestRoleNavigateStep(testResultStep, index, self);
          break;
        case TestCaseStepTypes.wait:
          step = new TestRoleWaitStep(testResultStep, index, self);
          break;
        case TestCaseStepTypes.custom:
          step = new TestRoleCustomStep(testResultStep, index, self);
          break;
        default:
          throw new Error(500, "Error", "Unknown TestCaseStepType: " + testResultStep.type)
      }
      
      step.init();
      return step
    });
  }
  
  /**
   * Connecto to the test system and launch the RobaDriver
   */
  connect () {
    logger.debug('TestRole.connect:', this._id, this.testSystem);
    let self   = this,
        config = {
          host               : self.testSystem.hostname,
          port               : self.testSystem.port,
          desiredCapabilities: {
            browserName : self.testAgent.identifier,
            loggingPrefs: { browser: 'ALL', driver: 'WARNING', client: 'WARNING', server: 'WARNING' }
          },
          logLevel           : 'silent',
          logPath            : self.logPath,
          end                : function (event) {
            logger.info('End event received from driver');
            self.driverEnded = true;
            if (!self.endIntentional) {
              logger.error('Driver end doesn`t look intentional:', event);
              self.setStatus(TestResultStatus.complete);
          
              // exit
              self.exit(1);
            }
          }
        };
    
    // Setup the driver
    logger.info('Creating RobaDriver');
    self.driver = new RobaDriver(config);
    
    // Set the timeouts for the driver
    logger.trace('Setting driver timeouts');
    self.driver.timeouts('implicit', 100);
    self.driver.timeouts('script', 5000);
    self.driver.timeouts('page load', 10000); // don't rely on this, and we don't want it getting in the way
    self.driver.timeoutsImplicitWait(100);
    self.driver.timeoutsAsyncScript(20000); // don't rely on this, and we don't want it getting in the way
    
    // Set the viewport if it's specified
    if (self.viewport) {
      logger.debug('Setting viewport:', self.viewport);
      try {
        self.driver.windowHandleSize({ width: self.viewport.width, height: self.viewport.height })
      } catch (e) {
        logger.error('Setting viewport failed:', e.toString(), e.stack);
      }
    } else {
      driver.windowHandleSize({ width: 1600, height: 900 })
    }
  }
  
  /**
   * Execute the TestResultRole
   */
  execute () {
    logger.debug('TestRole.execute');
    let self = this;
    
    // Update the role status
    self.serverLink.setTestResultRoleStatus(self._id, TestResultStatus.executing);
    
    // Backup the context so that it can be restored between steps
    self.context.backup(); //backup the context so we can restore it after each step
    self.driver.getClientLogs();
    
    // Go through each step and execute it
    let pass = true;
    for (let i = 0; i < self.steps.length; i++) {
      if (!self.testResult.abort && !self.driverEnded && pass) {
        self.context.restore();
        logger.debug('TestRole.execute launching step', i);
        pass = self.steps[ i ].execute();
      } else {
        logger.debug('TestRole.execute skipping step ', i, ', abort:', self.testResult.abort, 'driverEnded:', self.driverEnded, 'pass:', pass);
        self.steps[ i ].skip();
      }
    }
    
    // Restore the context
    self.context.restore();
    logger.info("TestRole.execute: all steps executed");
    
    // Done
    self.setStatus(TestResultStatus.complete);
    if (pass) {
      self.setResult(TestResultCodes.pass);
    }
  }
  
  /**
   * Load the manifest for this TestResultRole
   */
  loadTestRoleManifest () {
    logger.debug("Loading the TestRole Manifest:", this._id);
    let self = this,
        manifest;
    
    // Load the manifest from the server
    manifest = self.serverLink.loadTestRoleManifest(self._id);
    logger.trace("TestRole manifest: ", manifest);
    
    if (!manifest) {
      throw new Error("500", "Manifest Load Failed", "Failed to load role manifest " + self._id);
    }
    
    // Store the manifest data
    _.keys(manifest).forEach((key) => {
      logger.debug('Setting TestRole attribute from manifest:', key);
      logger.trace('Setting TestRole attribute from manifest:', key, manifest[ key ]);
      self[ key ] = manifest[ key ];
    });
    logger.trace("TestRole manifest loaded: ", self._id);
    
    // Update the context
    self.context.update({
      projectId       : self.record.projectId,
      projectVersionId: self.record.projectVersionId,
      testSystemId    : self.testSystem.staticId,
      testServerId    : self.testServer.staticId,
      testRunId       : self.record.testRunId,
      testResultId    : self.record.testResultId
    });
    
    // Enter a context milestone marking the launch of the testRole
    self.context.milestone({ type: 'test_result_role', data: self.record });
  }
  
  /**
   * Load the TestResult record for this TestResultRole
   */
  loadTestResultRecord () {
    logger.debug("Loading the TestRole TestResult record:", this.projectId, this.record.testResultId);
    this.testResult = this.serverLink.liveRecord('test_run_result', [ this.projectId, this.record.testResultId ], 'TestResults');
  }
  
  /**
   * Load the needed enums from the server
   */
  loadEnums () {
    logger.trace('TestRole.loadEnums');
    let self = this;
    
    NodeCheckTypes.load(self.serverLink, logger);
    ScreenshotKeys.load(self.serverLink, logger);
    TestCaseStepTypes.load(self.serverLink, logger);
    TestResultCodes.load(self.serverLink, logger);
    TestResultStatus.load(self.serverLink, logger);
  }
  
  /**
   * Set the status of the test role
   * @param status
   */
  setStatus (status) {
    logger.debug('TestRole.setStatus:', status);
    this.serverLink.setTestResultRoleStatus(this._id, status)
  }
  
  /**
   * Set the status of the test role
   * @param resultCode
   * @param result
   */
  setResult (resultCode, result) {
    logger.debug('TestRole.setResult:', resultCode, result);
    this.serverLink.setTestResultRoleResult(this._id, resultCode, result)
  }
  
  /**
   * Exit the adventure
   * @param code
   */
  exit (code) {
    logger.info("TestRole.exit:", code);
    let self = this;
    
    // Shut down the driver
    try {
      self.endIntentional = true;
      logger.info("Ending web driver");
      self.driver.end();
    } catch (e) {
    }
    
    // Close the ddp link
    try {
      logger.info("Closing DDP Link");
      self.serverLink.disconnect();
    } catch (e) {
    }
    
    // Shut down the logger
    log4js.shutdown(function () {
      setTimeout(function () {
        console.log("Calling process.exit");
        process.exit(code);
      }, 2000);
    });
  }
}

module.exports = TestRole;
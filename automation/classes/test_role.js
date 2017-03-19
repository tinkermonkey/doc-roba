"use strict";

var _             = require('underscore'),
    assert        = require('assert'),
    log4js        = require('log4js'),
    logger        = log4js.getLogger('adventure'),
    RobaDriver    = require('./driver/roba_driver.js'),
    keepAliveWait = 30,
    updatePeriod  = 2000,
    statePeriod   = 10000,
    pausePeriod   = 250,
    TestResultStatus, TestResultCodes, TestCaseStepTypes, ScreenshotKeys;

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
    logger.debug('Creating test role:', roleId, projectId, logPath);
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
    logger.debug('Adventure.init:', this._id);
    let self = this;
    
    // Setup a listener to exit gracefully on sigint
    process.on("SIGINT", function () {
      logger.info("Exiting - SIGINT");
      self.exit(0);
    });
    
    // Load the enums needed for an testRole
    self.serverLink.enums = self.serverLink.call('loadTestEnums');
    TestRole.setEnums(self.serverLink.enums);
    
    // Load the test role manifest
    logger.debug("Loading the TestRole Manifest");
    self.manifest = self.serverLink.loadTestRoleManifest(self._id);
    logger.trace("TestRole manifest: ", self.manifest);
    context.milestone({ type: "test_result_role", data: self.manifest.role });
    
    // Update the context
    self.context.update({
      projectId       : self.manifest.role.projectId,
      projectVersionId: self.manifest.role.projectVersionId,
      testAgentId     : self.manifest.agent.staticId,
      serverId        : self.manifest.server.staticId,
      testRunId       : self.manifest.role.testRunId,
      testResultId    : self.manifest.role.testResultId
    });
    
    // Update the status to launched
    self.setStatus(TestResultStatus.launched);
    
    // Enter a context milestone marking the launch of the testRole
    self.context.milestone({ type: 'test_result_role', data: self.record });
    
    // Create the adventure step objects
    logger.debug('Creating test role steps');
    adventure.stepRecords = adventure.serverLink.liveCollection('adventure_steps', [ adventure.record.projectId, adventure._id ]);
    logger.trace("TestRole steps:", adventure.stepRecords);
    if (adventure.stepRecords && _.keys(adventure.stepRecords).length) {
      adventure.steps = _.values(adventure.stepRecords).map((function (stepRecord, i) {
        let step = new TestRoleStep(stepRecord, i, adventure);
        step.init();
        return step;
      }));
    } else {
      logger.fatal("Fatal error: no steps found for adventure");
      throw new Error("TestRole contains no steps");
    }
  }
  
  /**
   * Set the status of the test role
   * @param status
   */
  setStatus (status) {
    let self = this;
    assert(status != null, 'TestRole.setStatus status cannot be null');
    
    logger.debug('TestRole.setStatus:', status);
    self.serverLink.call('setTestResultRoleStatus', [ self.projectId, self._id, status ])
  }
  
  /**
   * Set the enums based on the server response
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('TestRole.setEnums:', enums);
    TestResultStatus  = enums.resultStatus;
    TestResultCodes   = enums.resultCodes;
    TestCaseStepTypes = enums.stepTypes;
    ScreenshotKeys    = enums.screenshotKeys;
    //TestRoleStep.setEnums(enums);
  }
}
/**
 * ============================================================================
 * Test case result - the umbrella result for a test execution
 * ============================================================================
 */
Schemas.TestResult = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test run
  testRunId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the test case via the staticId
  testCaseId: {
    type: String,
    denyUpdate: true
  },
  // Link to the server we're running against
  serverId: {
    type: String,
    denyUpdate: true
  },
  // Whether to wait for commands if there is a problem
  pauseOnFailure: {
    type: Boolean,
    defaultValue: false
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // Abort the test
  abort: {
    type: Boolean,
    optional: true
  },
  // The result code
  resultCode: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
  },
  // The result detail
  result: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  }
});
TestResults = new Mongo.Collection("test_results");
TestResults.attachSchema(Schemas.TestResult);
TestResults.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestResults.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * Helpers
 */
TestResults.helpers({
  roleResults: function () {
    return TestResultRoles.find({testResultId: this._id});
  },
  project: function () {
    return Projects.findOne({_id: this.projectId});
  },
  projectVersion: function () {
    return ProjectVersions.findOne({_id: this.projectVersionId});
  },
  testCase: function () {
    return TestCases.findOne({staticId: this.testCaseId, projectVersionId: this.projectVersionId});
  },
  server: function () {
    return Servers.findOne({staticId: this.serverId, projectVersionId: this.projectVersionId});
  },
  testRun: function () {
    return TestRuns.findOne({staticId: this.testRunId, projectVersionId: this.projectVersionId});
  },
  isStaged: function () {
    return this.status = TestResultStatus.staged
  },
  isLaunching: function () {
    return this.status = TestResultStatus.launched
  },
  isRunning: function () {
    return this.status = TestResultStatus.executing
  },
  isDone: function () {
    return _.contains([
      TestResultStatus.complete,
      TestResultStatus.skipped
    ], this.status)
  },
  /**
   * Launch a staged test result
   */
  launch: function () {
    Meteor.log.debug("TestResult.launch: " + this._id);
    if(!Meteor.isServer) throw new Meteor.Error("server-only", "This method can only be executed on the server");

    // do some quick cleanup in case this is a re-run
    var result = this;
    LogMessages.remove({"context.testResultId": result._id});
    Screenshots.remove({testResultId: result._id});
    TestResults.update({_id: result._id}, {$set: {status: TestResultStatus.launched, abort: false}, $unset: {resultCode: "", result: ""}});
    TestResultRoles.update({testResultId: result._id}, {$set: {status: TestResultStatus.staged}, $unset: {resultCode: "", result: "", pid: ""}}, {multi: true});
    TestResultSteps.update({testResultId: result._id}, {$set: {status: TestResultStatus.staged}, $unset: {resultCode: "", result: "", checks: ""}}, {multi: true});

    // get the list of roles, create a launch token and fire away
    TestResultRoles.find({testResultId: result._id}).forEach(function (role) {
      Meteor.log.info("launchTestResult launching role: " + role._id);
      var token = Accounts.singleUseAuth.generate({ expires: { seconds: 5 } }),
        command = [ProcessLauncher.testRoleScript, "--roleId", role._id, "--token", token].join(" "),
        logFile = ["test_result_role_", role._id, ".log"].join(""),
        proc = ProcessLauncher.launchAutomation(command, logFile);

      TestResultRoles.update(role._id, {$set: {pid: proc.pid, status: TestResultStatus.launched}});
      Meteor.log.info("launchTestResult launched: " + role._id + " as " + proc.pid + " > " + logFile);
    });
  }
});
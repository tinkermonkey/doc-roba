/**
 * Template Helpers
 */
Template.TestCaseLauncher.helpers({
  accountId: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].accountId)){
      var userType = role.userType();
      if(userType){
        var account = userType.getAccount();
        if(account){
          config.roles[role.staticId] = config.roles[role.staticId] || {};
          config.roles[role.staticId].accountId = account._id;
          Template.instance().config.set(config);
        }
      }
    }
    if(role && role.staticId && config && config.roles[role.staticId]){
      return config.roles[role.staticId].accountId;
    }
  },
  serverId: function () {
    return Template.instance().config.get().serverId;
  },
  testSystemId: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].testSystemId)){
      var testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, active: true });
      if(testSystem){
        config.roles[role.staticId] = config.roles[role.staticId] || {};
        config.roles[role.staticId].testSystemId = testSystem.staticId;
        Template.instance().config.set(config);
      }
    }
    if(role && role.staticId && config && config.roles[role.staticId]){
      return config.roles[role.staticId].testSystemId;
    }
  },
  testAgentId: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].testAgentId && config.roles[role.staticId].testSystemId)){
      var testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, staticId: config.roles[role.staticId].testSystemId});
      if(testSystem && testSystem.testAgents && testSystem.testAgents.length){
        config.roles[role.staticId] = config.roles[role.staticId] || {};
        config.roles[role.staticId].testAgentId = testSystem.testAgents[0];
        Template.instance().config.set(config);
      }
    }
    if(role && role.staticId && config && config.roles[role.staticId]){
      return config.roles[role.staticId].testAgentId;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseLauncher.events({
  "click .btn-launch": function (e, instance) {
    console.log("Launch: ", instance.config.get());

    // prepare the run and make sure it works
    Meteor.call("validateTestCaseRunConfig", instance.data._id, instance.config.get(), function (error, result) {
      console.log("validateTestCaseRunConfig: ", error, result);
      if(error){
        Dialog.error("Invalid test config: " + error.toString());
      } else {
        Meteor.call("prepareTestCaseRun", instance.data._id, instance.config.get(), function (error, testResultId) {
          if(error){
            Dialog.error("prepareTestCaseRun failed: " + error.toString());
          } else if(testResultId) {
            Meteor.call("launchTestResult", testResultId, function (error, result) {
              if(error){
                Dialog.error("Launching test failed: " + error.toString());
              } else {
                // Open the test result
                Router.go("test_result", { projectId: instance.data.projectId, _id: testResultId });
              }
            });
          } else {
            Dialog.error("prepareTestCaseRun failed: null testResultId");
          }
        });
      }
    });
  }
});

/**
 * Template Created
 */
Template.TestCaseLauncher.created = function () {
  var instance = this;
  instance.config = new ReactiveVar({
    serverId: Servers.findOne({projectVersionId: this.data.projectVersionId, active: true}).staticId,
    roles: {}
  });
};

/**
 * Template Rendered
 */
Template.TestCaseLauncher.rendered = function () {
  var instance = this;
  instance.autorun(function () {
    var config = instance.config.get();
    console.log("config: ", config);
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseLauncher.destroyed = function () {
  
};

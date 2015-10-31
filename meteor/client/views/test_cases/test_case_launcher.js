/**
 * Template Helpers
 */
Template.TestCaseLauncher.helpers({
  getAccount: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!config.account){
      var userType = role.userType();
      if(userType){
        var account = userType.getAccount();
        if(account){
          config.account = account._id;
          Template.instance().config.set(config);
        }
      }
    }
    return config.account;
  },
  getServer: function () {
    return Template.instance().config.get().server;
  },
  getTestSystem: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!config.testSystem){
      var testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, active: true });
      if(testSystem){
        config.testSystem = testSystem.staticId;
        Template.instance().config.set(config);
      }
    }
    return config.testSystem;
  },
  getTestAgent: function () {
    var config = Template.instance().config.get(),
      role = this;
    if(!config.testAgent && config.testSystem){
      var testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, staticId: config.testSystem});
      if(testSystem && testSystem.testAgents && testSystem.testAgents.length){
        config.testAgent = testSystem.testAgents[0];
        Template.instance().config.set(config);
      }
    }
    return config.testAgent;
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseLauncher.events({});

/**
 * Template Created
 */
Template.TestCaseLauncher.created = function () {
  var instance = this,
    serverId = Servers.findOne({projectVersionId: this.data.projectVersionId, active: true}).staticId;
  instance.config = new ReactiveVar({ server: serverId });
};

/**
 * Template Rendered
 */
Template.TestCaseLauncher.rendered = function () {
  /*
  var instance = this;
  instance.autorun(function () {
    var config = instance.config.get();
    console.log("config: ", config);
  });
  */
};

/**
 * Template Destroyed
 */
Template.TestCaseLauncher.destroyed = function () {
  
};

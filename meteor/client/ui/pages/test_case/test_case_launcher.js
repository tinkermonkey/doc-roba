import './test_case_launcher.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {TestSystems} from '../../../../imports/api/test_systems/test_systems.js';
import {TestServers} from '../../../../imports/api/test_servers/test_servers.js';

import '../../components/editable_fields/editable_server_selector.js';
import '../../components/editable_fields/editable_user_account.js';
import '../../components/editable_fields/editable_test_agent_selector.js';
import '../../components/editable_fields/editable_test_system_selector.js';

/**
 * Template Helpers
 */
Template.TestCaseLauncher.helpers({
  accountId() {
    let config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].accountId)){
      let userType = role.userType();
      if(userType){
        let account = userType.getAccount();
        if(account){
          config.roles[role.staticId] = config.roles[role.staticId] || {};
          config.roles[role.staticId].accountId = account.staticId;
          Template.instance().config.set(config);
        }
      }
    }
    if(role && role.staticId && config && config.roles[role.staticId]){
      return config.roles[role.staticId].accountId;
    }
  },
  serverId() {
    let config = Template.instance().config.get();
    if(config){
      return config.serverId;
    }
  },
  testSystemId() {
    let config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].testSystemId)){
      let testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, active: true });
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
  testAgentId() {
    let config = Template.instance().config.get(),
      role = this;
    if(!(config.roles[role.staticId] && config.roles[role.staticId].testAgentId && config.roles[role.staticId].testSystemId)){
      let testSystem = TestSystems.findOne({ projectVersionId: role.projectVersionId, staticId: config.roles[role.staticId].testSystemId});
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
  "click .btn-launch"(e, instance) {
    console.log("Launch: ", instance.config.get());

    // prepare the run and make sure it works
    Meteor.call("validateTestCaseRunConfig", instance.data._id, instance.config.get(), function (error, result) {
      console.log("validateTestCaseRunConfig: ", error, result);
      if(error){
        RobaDialog.error("Invalid test config: " + error.toString());
      } else {
        Meteor.call("prepareTestCaseRun", instance.data._id, instance.config.get(), function (error, testResultId) {
          if(error){
            RobaDialog.error("prepareTestCaseRun failed: " + error.toString());
          } else if(testResultId) {
            Meteor.call("launchTestResult", instance.data.projectId, testResultId, function (error, result) {
              if(error){
                RobaDialog.error("Launching test failed: " + error.toString());
              } else {
                // Open the test result
                FlowRouter.go("TestResult", {
                  projectId: instance.data.projectId,
                  projectVersionId: instance.data.projectVersionId,
                  testResultId: testResultId
                });
              }
            });
          } else {
            RobaDialog.error("prepareTestCaseRun failed: null testResultId");
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
  let instance = Template.instance();
  instance.config = new ReactiveVar();

  instance.autorun(function () {
    instance.subscribe("nodes", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("test_servers", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("test_systems", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("test_agents", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("version_datastore_fields", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("version_datastore_rows", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("datastores", instance.data.projectId, instance.data.projectVersionId);

    if(instance.subscriptionsReady()){
      let server = TestServers.findOne({projectVersionId: instance.data.projectVersionId, active: true});
      if(server){
        instance.config.set({
          serverId: server.staticId,
          roles: {}
        });
      } else {
        consolle.error("TestCaseLauncher: no active servers for this project version");
      }
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseLauncher.rendered = function () {
  let instance = Template.instance();
  instance.autorun(function () {
    let config = instance.config.get();
    console.log("TestCaseLauncher config: ", config);
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseLauncher.destroyed = function () {
  
};

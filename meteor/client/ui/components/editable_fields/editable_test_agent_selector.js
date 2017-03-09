import './editable_test_agent_selector.html';

import {Template} from 'meteor/templating';

import {Util} from '../../../../imports/api/util.js'
import {TestAgents} from '../../../../imports/api/test_agents/test_agents.js';

/**
 * Template Helpers
 */
Template.EditableTestAgentSelector.helpers({});

/**
 * Template Helpers
 */
Template.EditableTestAgentSelector.events({});

/**
 * Template Rendered
 */
Template.EditableTestAgentSelector.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      testAgents = TestAgents.find({
        projectVersionId: instance.data.projectVersionId
      }, {sort: {title: 1}}).map(function (testAgent) {
        return { value: testAgent.staticId, text: Util.getTestAgentNameWithVersion(testAgent) };
      });

    instance.$('.editable-test-agent-selector').editable({
      mode: instance.data.mode || "inline",
      type: "select",
      source: testAgents,
      highlight: false,
      display() {},
      success(response, newValue) {
        var editedElement = this;
        $(editedElement).trigger("edited", [newValue]);
        setTimeout(function () {
          $(editedElement).removeClass('editable-unsaved');
        }, 10);
      }
    });
    instance.$('.editable-test-agent-selector').editable("option", "source", testAgents);
    instance.$('.editable-test-agent-selector').editable("setValue", data.value, true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTestAgentSelector.destroyed = function () {

};

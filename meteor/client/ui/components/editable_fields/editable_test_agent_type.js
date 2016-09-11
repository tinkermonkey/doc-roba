import './editable_test_agent_type.html';

import {Template} from 'meteor/templating';

import {Util} from '../../../../imports/api/util.js'
import {TestAgentTypes, TestAgentTypesLookup} from '../../../../imports/api/test_agent/test_agent_types.js';

/**
 * Template Helpers
 */
Template.EditableTestAgentType.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableTestAgentType.events({});

/**
 * Template Rendered
 */
Template.EditableTestAgentType.rendered = function () {
  var instance = Template.instance(),
    types = _.keys(TestAgentTypesLookup);

  if(instance.data.noGrid){
    types = _.filter(types, function (type) { return type != TestAgentTypes.grid} );
  }

  instance.$('.editable-test-agent-type').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: _.map(types, function (type) {
      return {value: type, text: Util.camelToTitle(TestAgentTypesLookup[type])};
    }),
    highlight: false,
    display() {
    },
    success(response, newValue) {
      var editedElement = this;
      if (TestAgentTypesLookup[newValue]) {
        $(editedElement).trigger("edited", [newValue]);
      } else {
        console.error("Test Agent Type update failed, Test Agent Type not known: " + newValue);
        RobaDialog.error("Test Agent Type update failed. Test Agent Type not known: " + newValue);
      }

      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$('.editable-test-agent-type').editable("setValue", data.value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTestAgentType.destroyed = function () {

};

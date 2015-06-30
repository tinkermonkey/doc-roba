/**
 * Template Helpers
 */
Template.EditableTestAgentOS.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableTestAgentOS.events({});

/**
 * Template Rendered
 */
Template.EditableTestAgentOS.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-test-agent-os').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: _.map(_.keys(TestAgentOSLookup), function (os) {
      return {value: os, text: Util.capitalize(TestAgentOSLookup[os])};
    }),
    highlight: false,
    display: function () {
    },
    success: function (response, newValue) {
      var editedElement = this;
      if (TestAgentOSLookup[newValue]) {
        $(editedElement).trigger("edited", [newValue]);
      } else {
        Meteor.log.error("Test Agent OS update failed, Test Agent OS not known: " + newValue);
        Dialog.error("Test Agent OS update failed. Test Agent OS not known: " + newValue);
      }

      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$('.editable-test-agent-os').editable("setValue", data.value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTestAgentOS.destroyed = function () {

};
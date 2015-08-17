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
    display: function () {
    },
    success: function (response, newValue) {
      var editedElement = this;
      if (TestAgentTypesLookup[newValue]) {
        $(editedElement).trigger("edited", [newValue]);
      } else {
        Meteor.log.error("Test Agent Type update failed, Test Agent Type not known: " + newValue);
        Dialog.error("Test Agent Type update failed. Test Agent Type not known: " + newValue);
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

/**
 * Template Helpers
 */
Template.EditableTestAgentList.helpers({
  valueList: function () {
    return this.value ? this.value.join(",") : ''
  }
});

/**
 * Template Helpers
 */
Template.EditableTestAgentList.events({});

/**
 * Template Rendered
 */
Template.EditableTestAgentList.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      query = { projectVersionId: instance.data.projectVersionId };

    // only show the correct type of test agents for the type provided
    // if it's a grid or no type, show everything
    switch (data.type) {
      case TestAgentTypes.selenium:
        query["type"] = TestAgentTypes.selenium;
        break;
      case TestAgentTypes.appium:
        query["type"] = TestAgentTypes.appium;
        break;
    }

    var testAgents = Collections.TestAgents.find(query, {sort: {type: 1, order: 1}}).map(function (testAgent) {
        return { value: testAgent.staticId, text: Util.getTestAgentNameWithVersion(testAgent) };
      });

    instance.$('.editable-test-agent-list').editable({
      mode: data.mode || "inline",
      type: "checklist",
      source: testAgents,
      highlight: false,
      display: function () {},
      success: function (response, newValue) {
        var editedElement = this;
        $(editedElement).trigger("edited", [newValue]);
        setTimeout(function () {
          $(editedElement).removeClass('editable-unsaved');
        }, 10);
      }
    });
    instance.$('.editable-test-agent-list').editable("option", "source", testAgents);
    instance.$('.editable-test-agent-list').editable("setValue", data.value ? data.value.join(",") : '', true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTestAgentList.destroyed = function () {

};

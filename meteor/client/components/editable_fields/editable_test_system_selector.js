/**
 * Template Helpers
 */
Template.EditableTestSystemSelector.helpers({});

/**
 * Template Helpers
 */
Template.EditableTestSystemSelector.events({});

/**
 * Template Rendered
 */
Template.EditableTestSystemSelector.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      query = {
        projectVersionId: instance.data.projectVersionId,
        active: true
      };
    
    if(data.platform){
      query.platform = data.platform;
    }
    
    if(data.testAgent){
      query.testAgents = data.testAgent;
    }

    //console.log("test system selector query: ", query);

    var testSystems = TestSystems.find(query, {sort: {title: 1}}).map(function (testSystem) {
        return { value: testSystem.staticId, text: testSystem.title };
      });

    instance.$('.editable-test-system-selector').editable({
      mode: instance.data.mode || "inline",
      type: "select",
      source: testSystems,
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
    instance.$('.editable-test-system-selector').editable("option", "source", testSystems);
    instance.$('.editable-test-system-selector').editable("setValue", data.value, true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTestSystemSelector.destroyed = function () {

};

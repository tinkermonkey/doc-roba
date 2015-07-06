/**
 * Template Helpers
 */
Template.EditableNodeSelector.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableNodeSelector.events({});

/**
 * Template Created
 */
Template.EditableNodeSelector.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableNodeSelector.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable").editable({
    type: "nodeSelector",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement,
    value: instance.data.value,
    projectVersionId: instance.data.projectVersionId,
    parentInstance: instance,
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      console.log("EditableNodeSelector edited: ", newValue);
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.searchView){
      Blaze.remove(instance.searchView);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("setValue", data.value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableNodeSelector.destroyed = function () {
  
};

/**
 * Template Helpers
 */
Template.EditableActionRouteSelector.helpers({
  getSteps: function () {
    if(this.value){
      var steps = [];
      if(this.value.actionId){
        steps.push({ actionId: this.value.actionId });
      }
      if(this.value.nodeId) {
        steps.push({ nodeId: this.value.nodeId })
      }
      return steps
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditableActionRouteSelector.events({});

/**
 * Template Created
 */
Template.EditableActionRouteSelector.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableActionRouteSelector.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable").editable({
    type: "actionRouteSelector",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    value: instance.data.value,
    projectVersionId: instance.data.projectVersionId,
    nodeId: instance.data.nodeId,
    parentInstance: instance,
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      console.log("EditableActionRouteSelector edited: ", newValue);
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.selectorView){
      setTimeout(function () {
        Blaze.remove(instance.selectorView);
      }, 100);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();

    instance.$(".editable").editable("setValue", data.value);
    instance.$(".editable").editable("option", "nodeId", data.nodeId);
  });
};

/**
 * Template Destroyed
 */
Template.EditableActionRouteSelector.destroyed = function () {
  
};

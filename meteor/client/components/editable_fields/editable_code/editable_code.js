/**
 * Template Helpers
 */
Template.EditableCode.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableCode.events({});

/**
 * Template Created
 */
Template.EditableCode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableCode.rendered = function () {
  var instance = this;

  instance.$(".editable").editable({
    type: "editableAce",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    data: instance.data,
    parentInstance: instance,
    highlight: false,
    onblur: "ignore",
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.formView){
      setTimeout(function () {
        Blaze.remove(instance.formView);
      }, 100);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("option", "data", data);
  });
};

/**
 * Template Destroyed
 */
Template.EditableCode.destroyed = function () {
  
};

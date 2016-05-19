/**
 * Template Helpers
 */
Template.EditableFilterTime.helpers({
  hasValue: function () {
    var value = Template.instance().value.get();
    return value.start != null || value.end != null;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableFilterTime.events({});

/**
 * Template Created
 */
Template.EditableFilterTime.created = function () {
  var instance = this;
  instance.value = new ReactiveVar({});
};

/**
 * Template Rendered
 */
Template.EditableFilterTime.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable").editable({
    type: "editableFilterTime",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    value: instance.data.value,
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      console.log("EditableFilterTime edited: ", newValue);
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
      instance.value.set(newValue);
    }
  });

  instance.autorun(function () {
    var value = instance.value.get();
    instance.$(".editable").editable("setValue", value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableFilterTime.destroyed = function () {
  
};

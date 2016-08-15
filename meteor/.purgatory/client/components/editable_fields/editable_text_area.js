/**
 * Template Helpers
 */
Template.EditableTextArea.helpers({});

/**
 * Template Helpers
 */
Template.EditableTextArea.events({});

/**
 * Template Rendered
 */
Template.EditableTextArea.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable-text-area").editable({
    type: "textarea",
    mode: instance.data.mode || "inline",
    placement: instance.data.placement,
    value: instance.data.value,
    emptyText: instance.data.emptyText || "empty",
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

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable-text-area").editable("setValue", data.value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTextArea.destroyed = function () {

};

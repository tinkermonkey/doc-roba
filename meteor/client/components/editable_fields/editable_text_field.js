/**
 * Template Helpers
 */
Template.EditableTextField.helpers({});

/**
 * Template Helpers
 */
Template.EditableTextField.events({});

/**
 * Template Rendered
 */
Template.EditableTextField.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable-text-field").editable({
    mode: instance.data.mode || "inline",
    placement: instance.data.placement,
    value: instance.data.value,
    emptyText: instance.data.emptyText || "empty",
    highlight: false,
    display: function () {},
    validate: function (value) {
      var dataType = $(this).attr("data-type");
      if(dataType && this.willValidate !== undefined){
        console.log("Validate: ", dataType, this.willValidate, value);
        return this.willValidate ? null : 'Please enter a valid ' + dataType;
      }
    },
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
    instance.$(".editable-text-field").editable("setValue", data.value);
  });
};

/**
 * Template Destroyed
 */
Template.EditableTextField.destroyed = function () {

};

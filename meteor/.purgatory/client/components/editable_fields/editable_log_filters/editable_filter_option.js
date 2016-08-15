/**
 * Template Helpers
 */
Template.EditableFilterOption.helpers({
  hasValue: function () {
    var value = Template.instance().value.get();
    return value != null;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableFilterOption.events({});

/**
 * Template Created
 */
Template.EditableFilterOption.created = function () {
  var instance = this;
  instance.value = new ReactiveVar();
};

/**
 * Template Rendered
 */
Template.EditableFilterOption.rendered = function () {
  var instance = Template.instance();
  
  instance.autorun(function () {
    var data = Template.currentData(),
        currentValue = instance.value.get(),
        options =  _.map(_.uniq(data.messages.map(function (message) { return message[data.dataKey] })), function (option) {
          return { value: option, text: option };
        });
    
    console.log("EditableFilterOption:", options);
    if(!instance.editable){
      instance.editable = instance.$('.editable').editable({
        mode: data.mode || "popup",
        type: "checklist",
        source: options,
        placement: instance.data.placement || "auto",
        highlight: false,
        display: function () {},
        success: function (response, newValue) {
          var editedElement = this;
          $(editedElement).trigger("edited", [newValue]);
          setTimeout(function () {
            $(editedElement).removeClass('editable-unsaved');
          }, 10);
          instance.value.set(newValue);
        }
      });
    }
    instance.$('.editable').editable("option", "source", options);
    instance.$('.editable').editable("setValue", currentValue ? currentValue.join(",") : '', true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableFilterOption.destroyed = function () {
  
};

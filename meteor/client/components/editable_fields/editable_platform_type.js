/**
 * Template Helpers
 */
Template.EditablePlatformType.helpers({});

/**
 * Template Helpers
 */
Template.EditablePlatformType.events({});

/**
 * Template Rendered
 */
Template.EditablePlatformType.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-platform-type').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: _.map(_.values(PlatformTypes), function (type) {
      return { value: type, text: Util.capitalize(PlatformTypesLookup[type])}
    }),
    highlight: false,
    display: function () {
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
    instance.$('.editable-platform-type').editable("setValue", data.value, true);
  });

};

/**
 * Template Destroyed
 */
Template.EditablePlatformType.destroyed = function () {

};

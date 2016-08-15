/**
 * Template Helpers
 */
Template.EditableNodeType.helpers({});

/**
 * Template Helpers
 */
Template.EditableNodeType.events({});

/**
 * Template Rendered
 */
Template.EditableNodeType.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-node-type').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: _.map(_.values(NodeTypes).filter(function (t) {
      return instance.data.pageView ? t == NodeTypes.page || t == NodeTypes.view : true;
    }), function (type) {
      return { value: type, text: Util.camelToTitle(NodeTypesLookup[type])}
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
    instance.$('.editable-node-type').editable("setValue", data.value, true);
  });

};

/**
 * Template Destroyed
 */
Template.EditableNodeType.destroyed = function () {

};

/**
 * Template Helpers
 */
Template.EditableCustomFieldType.helpers({
  isCustom: function () {
    return this.type === FieldTypes.custom;
  }
});

/**
 * Template Helpers
 */
Template.EditableCustomFieldType.events({});

/**
 * Template Rendered
 */
Template.EditableCustomFieldType.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      types = DataStores.find({
        projectVersionId: instance.data.projectVersionId,
        deleted: false,
        category: DataStoreCategories.userTypeCustom
      }, {sort: {title: 1}}).map(function (type) {
        return { value: type._id, text: type.title };
      });

    instance.$('.editable-custom-field-type').editable({
      mode: instance.data.mode || "inline",
      type: "select",
      source: types,
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
    instance.$('.editable-custom-field-type').editable("option", "source", types);
    instance.$('.editable-custom-field-type').editable("setValue", data.customFieldType, true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableCustomFieldType.destroyed = function () {

};

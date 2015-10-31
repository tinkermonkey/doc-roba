/**
 * Template Helpers
 */
Template.EditableUserAccount.helpers({
});

/**
 * Template Event Handlers
 */
Template.EditableUserAccount.events({
  
});

/**
 * Template Created
 */
Template.EditableUserAccount.created = function () {
};

/**
 * Template Rendered
 */
Template.EditableUserAccount.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData();
    if(data.userType && data.userType._id){
      var accounts = DSUtil.getRenderedDataStoreRows(data.userType._id);

      instance.$('.editable-user-account-selector').editable({
        mode: instance.data.mode || "inline",
        type: "select",
        source: accounts,
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
      instance.$('.editable-user-account-selector').editable("option", "source", accounts);
      instance.$('.editable-user-account-selector').editable("setValue", data.value, true);
    }
  });
};

/**
 * Template Destroyed
 */
Template.EditableUserAccount.destroyed = function () {

};

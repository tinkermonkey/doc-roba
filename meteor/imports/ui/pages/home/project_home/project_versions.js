/**
 * Template Helpers
 */
Template.ProjectVersions.helpers({
  projectVersions: function () {
    return Collections.ProjectVersions.find({ projectId: this._id }, { sort: { version: -1 } });
  },
  project: function () {
    return Collections.Projects.findOne(this.projectId);
  }
});

/**
 * Template Helpers
 */
Template.ProjectVersions.events({
  "click .btn-add-version": function (event, instance) {
    var project = instance.data;
    console.log("Add Version:", project);

    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: new SimpleSchema({
        sourceVersionId: {
          label: "Source Version",
          type: String,
          autoform: {
            options: Collections.ProjectVersions.find({projectId: project._id}, {sort: {title: 1}}).map(function (version) { return {label: version.version, value: version._id}; })
          }
        },
        versionString: {
          label: "Version String",
          type: String
        }
      }),
      rowData: {}
    };

    // render the form
    Dialog.show({
      contentTemplate: 'DataStoreRowFormVert',
      contentData: formContext,
      title: "Add Project Version",
      buttons: [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "Add"){
          // grab the form data
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)){
            var versionInfo = _.clone(AutoForm.getFormValues(formId).insertDoc);
            console.log("versionInfo:", versionInfo);

            // send the invite
            Meteor.call("createVersion", versionInfo.sourceVersion, versionInfo.versionString, function (error) {
              Dialog.hide(function () {
                if(error) {
                  Dialog.error("Creating Version Failed: " + error.toString());
                }
              });
            });
          }
        } else {
          Dialog.hide();
        }
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.ProjectVersions.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ProjectVersions.destroyed = function () {

};

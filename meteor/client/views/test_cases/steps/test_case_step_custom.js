/**
 * Template Helpers
 */
Template.TestCaseStepCustom.helpers({
  hasCode: function () {
    return this.data && this.data.code && this.data.code.trim().length
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepCustom.events({
  "click .click-to-edit": function (e, instance) {
    instance.$(".custom-editor-container").removeClass("hide");
    $(e.target).addClass("hide");
    var aceInstance = Blaze.getView(instance.$(".roba-ace").get(0)).templateInstance();
    aceInstance.editor.focus();
  },
  "blur": function (e, instance) {
    // get a handle to the ace instance
    var aceInstance = Blaze.getView(instance.$(".roba-ace").get(0)).templateInstance(),
      contentLength = aceInstance.editor.getValue().trim().length;

    if(contentLength < 1){
      instance.$(".custom-editor-container").addClass("hide");
      instance.$(".click-to-edit").removeClass("hide");
    }
  }
});

/**
 * Template Created
 */
Template.TestCaseStepCustom.created = function () {

};

/**
 * Template Rendered
 */
Template.TestCaseStepCustom.rendered = function () {
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData(),
      previousStep = TestCaseSteps.findOne({
        testCaseRoleId: data.testCaseRoleId,
        order: {$lt: data.order}
      }, {sort: {order: -1}}),
      allowableTypes = [
        TestCaseStepTypes.custom,
        TestCaseStepTypes.action,
        TestCaseStepTypes.node,
        TestCaseStepTypes.wait,
      ];

    if(!_.contains(allowableTypes, previousStep.type)){
      data.error.set("This step requires a stable defined location")
    } else {
      data.error.set();
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseStepCustom.destroyed = function () {
  
};

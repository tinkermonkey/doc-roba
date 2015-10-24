/**
 * Template Helpers
 */
Template.TestRunTemplateDashboard.helpers({
  getFullContext: function () {
    var instance = Template.instance();
    this.testRunTemplateId = instance.testRunTemplateId;
    return this;
  },
  hasTestRun: function () {
    return this.testRunTemplateId.get();
  },
  getTestRunTemplate: function () {
    var testRunTemplateId = this.testRunTemplateId.get();
    if(testRunTemplateId){
      return TestRunTemplates.findOne(testRunTemplateId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunTemplateDashboard.events({});

/**
 * Template Created
 */
Template.TestRunTemplateDashboard.created = function () {
  var instance = Template.instance();
  instance.testRunTemplateId = new ReactiveVar();

};

/**
 * Template Rendered
 */
Template.TestRunTemplateDashboard.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestRunTemplateDashboard.destroyed = function () {
  
};

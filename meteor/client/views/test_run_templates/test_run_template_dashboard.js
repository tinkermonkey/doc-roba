/**
 * Template Helpers
 */
Template.TestRunTemplateDashboard.helpers({
  testRunTemplateId: function () {
    if(this.query && this.query.testRunTemplateId){
      return this.query.testRunTemplateId;
    }
  },
  testRunTemplate: function () {
    if(this.query && this.query.testRunTemplateId){
      return Collections.TestRunTemplates.findOne(this.query.testRunTemplateId);
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

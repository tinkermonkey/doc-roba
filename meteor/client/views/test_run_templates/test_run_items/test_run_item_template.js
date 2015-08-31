/**
 * Template Helpers
 */
Template.TestRunItemTemplate.helpers({
  getTemplate: function () {
    return TestRunTemplates.findOne({staticId: this.config.templateId, projectVersionId: this.projectVersionId});
  },
  itemCount: function () {
    return TestRunTemplateItems.find({templateId: this.staticId, type: TestRunItemTypes.test, projectVersionId: this.projectVersionId}).count();
  },
  stageCount: function () {
    return TestRunTemplateItems.find({parentId: this.staticId, type: TestRunItemTypes.stage, projectVersionId: this.projectVersionId}).count();
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunItemTemplate.events({});

/**
 * Template Created
 */
Template.TestRunItemTemplate.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestRunItemTemplate.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRunItemTemplate.destroyed = function () {
  
};

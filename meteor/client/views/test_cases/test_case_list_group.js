/**
 * Template Helpers
 */
Template.TestCaseListGroup.helpers({
  getGroups: function () {
    return TestGroups.find({ parentGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } });
  },
  getTestCases: function () {
    return TestCases.find({ testGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseListGroup.events({});

/**
 * Template Created
 */
Template.TestCaseListGroup.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseListGroup.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseListGroup.destroyed = function () {
  
};

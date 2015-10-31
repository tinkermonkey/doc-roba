/**
 * Template Helpers
 */
Template.TestCaseDashboard.helpers({
  testCaseId: function () {
    if(this.query && this.query.testCaseId){
      return this.query.testCaseId;
    }
  },
  testCase: function () {
    if(this.query && this.query.testCaseId){
      return TestCases.findOne(this.query.testCaseId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseDashboard.events({});

/**
 * Template Created
 */
Template.TestCaseDashboard.created = function () {
};

/**
 * Template Rendered
 */
Template.TestCaseDashboard.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestCaseDashboard.destroyed = function () {
  
};

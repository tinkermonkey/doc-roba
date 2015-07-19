/**
 * Template Helpers
 */
Template.TestCaseDashboard.helpers({
  getFullContext: function () {
    var instance = Template.instance();
    this.testCaseId = instance.testCaseId;
    return this;
  },
  hasTestCase: function () {
    return this.testCaseId.get();
  },
  getTestCase: function () {
    var testCaseId = this.testCaseId.get();
    if(testCaseId){
      return TestCases.findOne(testCaseId);
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
  var instance = Template.instance();
  instance.testCaseId = new ReactiveVar();

};

/**
 * Template Rendered
 */
Template.TestCaseDashboard.rendered = function () {
  setTimeout(function () {
    $(".auto-slide-right").removeClass("intro-slide-right");
    $(".auto-slide-left").removeClass("intro-slide-left");
  }, 500);
};

/**
 * Template Destroyed
 */
Template.TestCaseDashboard.destroyed = function () {
  
};

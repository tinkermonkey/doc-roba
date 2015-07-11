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
  // sometimes the transition doesn't fire, seeing if this ever fails
  $(".auto-transition.intro-slide-right").removeClass("intro-slide-right");
  $(".auto-transition.intro-slide-left").removeClass("intro-slide-left");
};

/**
 * Template Destroyed
 */
Template.TestCaseDashboard.destroyed = function () {
  
};

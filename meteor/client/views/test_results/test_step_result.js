/**
 * Template Helpers
 */
Template.TestStepResult.helpers({
  screenshots: function () {
    return ScreenShots.find({ testStepResultId: this._id }, {sort: {createdAt: 1}});
  },
  isExecuting: function () {
    return _.contains([TestResultStatus.executing, TestResultStatus.launched], this.status);
  },
  hasExecuted: function () {
    return _.contains([TestResultStatus.complete], this.status);
  },
  isError: function () {
    return _.contains([TestResultStatus.error], this.status);
  },
  getStepClass: function () {
    switch (this.status) {
      case TestResultStatus.executing:
      case TestResultStatus.launched:
        return "test-step-result-executing";
      case TestResultStatus.complete:
        return "test-step-result-" + this.type;
      case TestResultStatus.error:
        return "test-step-result-error";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestStepResult.events({});

/**
 * Template Created
 */
Template.TestStepResult.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestStepResult.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestStepResult.destroyed = function () {
  
};

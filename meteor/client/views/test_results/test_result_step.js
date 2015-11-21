// TODO: This sucks, find a better way to figure out the pitch
var screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestResultStep.helpers({
  getScreenshotBottom: function () {
    return this.index * screenshotPitch;
  },
  getStepClass: function () {
    switch (this.status) {
      case TestResultStatus.executing:
      case TestResultStatus.launched:
        return "test-result-step-executing";
      case TestResultStatus.complete:
        return "test-result-step-type-" + this.type + " test-step-result-" + this.resultCode;
    }
  },
  getStepTemplate: function () {
    switch (this.type) {
      case TestCaseStepTypes.node:
        return "TestResultStepNode";
      case TestCaseStepTypes.action:
        return "TestResultStepAction";
      case TestCaseStepTypes.navigate:
        return "TestResultStepNavigate";
      case TestCaseStepTypes.wait:
        return "TestResultStepWait";
      case TestCaseStepTypes.custom:
        return "TestResultStepCustom";
    }
  },
  getStepTitle: function () {
    return TestCaseStepTypesLookup[this.type]
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStep.events({
  "click .test-result-detail-1-reveal": function (e, instance) {
    var reveal = $(e.target).closest(".test-result-detail-reveal"),
      detail1 = instance.$(".test-result-detail-1"),
      detail2 = instance.$(".test-result-detail-2"),
      reveal2 = instance.$(".test-result-detail-2-reveal");

    // show the detail-1 content
    if(detail1.is(":visible")){
      detail2.hide();
      reveal2.hide();
      detail1.hide();
    } else {
      detail1.show();
      reveal2.show();
    }

    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
  "click .test-result-detail-2-reveal": function (e, instance) {
    var reveal2 = $(e.target).closest(".test-result-detail-reveal"),
      detail2 = instance.$(".test-result-detail-2");

    if(detail2.is(":visible")){
      detail2.fadeOut();
    } else {
      detail2.fadeIn();
    }
    reveal2.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal2.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
  "load .test-result-screenshot": function (e, instance) {
    var maxHeight = 0,
      maxWidth = 0,
      totalHeight = 0,
      width, height;

    instance.$(".test-result-screenshot-container").each(function (i, el) {
      width = parseInt($(el).outerWidth());
      height = parseInt($(el).outerHeight());
      maxWidth = width > maxWidth ? width : maxWidth;
      maxHeight = height > maxHeight ? height : maxHeight;
      totalHeight += screenshotPitch;
    });
    totalHeight += maxHeight - screenshotPitch;

    if(maxWidth && totalHeight){
      //console.log("onload: ", instance.data._id, maxWidth, totalHeight);
      instance.$(".test-result-screenshots > div").height(totalHeight).width(maxWidth);
      instance.$(".test-result-screenshots").height(totalHeight).width(maxWidth).show();
    }
  }
});

/**
 * Template Created
 */
Template.TestResultStep.created = function () {
};

/**
 * Template Rendered
 */
Template.TestResultStep.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.TestResultStep.destroyed = function () {
  
};

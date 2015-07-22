// TODO: This sucks, find a better way to figure out the pitch
var screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestStepResult.helpers({
  screenshots: function () {
    return ScreenShots.find({ testStepResultId: this._id }, {sort: {createdAt: -1}}).map(function (image, i) {image.index = i; return image});
  },
  getScreenshotBottom: function () {
    return this.index * screenshotPitch;
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
  },
  getStepTemplate: function () {
    switch (this.type) {
      case TestCaseStepTypes.node:
        return "TestStepResultNode";
      case TestCaseStepTypes.action:
        return "TestStepResultAction";
      case TestCaseStepTypes.navigate:
        return "TestStepResultNavigate";
      case TestCaseStepTypes.wait:
        return "TestStepResultWait";
      case TestCaseStepTypes.custom:
        return "TestStepResultCustom";
    }
  },
  getStepLogMessages: function () {
    return LogMessages.find({ "context.testStepResultId": this._id }, {sort: {time: 1}});
  }
});

/**
 * Template Event Handlers
 */
Template.TestStepResult.events({
  "click .test-result-detail-1-reveal": function (e, instance) {
    var reveal = $(e.target).closest(".test-result-detail-reveal"),
      detail1 = instance.$(".test-result-detail-1"),
      detail2 = instance.$(".test-result-detail-2"),
      reveal2 = instance.$(".test-result-detail-2-reveal");

    // show the detail-1 content
    if(detail1.is(":visible")){
      /*
      detail2.hide('slide',{ direction:'left' }, 400, function () {
        reveal2.hide();
        detail1.hide('slide',{ direction:'left' }, 400);
      });
      */
      detail2.fadeOut();
      reveal2.fadeOut();
      detail1.fadeOut();
    } else {
      detail1.fadeIn();
      reveal2.fadeIn();
      /*
      detail1.show('slide',{ direction:'left' }, 400, function () {
        reveal2.show();
      });
      */
    }

    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
  "click .test-result-detail-2-reveal": function (e, instance) {
    var reveal2 = $(e.target).closest(".test-result-detail-reveal"),
      detail2 = instance.$(".test-result-detail-2");

    if(detail2.is(":visible")){
      //detail2.hide('slide',{ direction:'left' }, 400);
      detail2.fadeOut();
    } else {
      //detail2.show('slide',{ direction:'left' }, 400);
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
      console.log("onload: ", instance.data._id, maxWidth, totalHeight);
      instance.$(".test-result-screenshots > div").height(totalHeight).width(maxWidth);
      instance.$(".test-result-screenshots").height(totalHeight).width(maxWidth).show();
    }
  }
});

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

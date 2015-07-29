/**
 * Template Helpers
 */
Template.TestStepResultLog.helpers({
  maxLogWidth: function () {
    return Template.instance().maxLogWidth.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestStepResultLog.events({});

/**
 * Template Created
 */
Template.TestStepResultLog.created = function () {
  this.maxLogWidth = new ReactiveVar(parseInt(window.innerWidth / 3));
  console.log("TestStepResultLog.created: ", Date.now());
};

/**
 * Template Rendered
 */
Template.TestStepResultLog.rendered = function () {
  console.log("TestStepResultLog.rendered: ", Date.now());
  var instance = this;
  instance.autorun(function () {
    var resize = Session.get("resize");
    instance.maxLogWidth.set(parseInt(resize.width / 3));
  });
};

/**
 * Template Destroyed
 */
Template.TestStepResultLog.destroyed = function () {
  
};

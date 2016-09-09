/**
 * Template Helpers
 */
Template.TestResultStepLog.helpers({
  maxLogWidth: function () {
    return Template.instance().maxLogWidth.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepLog.events({});

/**
 * Template Created
 */
Template.TestResultStepLog.created = function () {
  this.startTime = Date.now();
  this.maxLogWidth = new ReactiveVar(parseInt(window.innerWidth / 3));
};

/**
 * Template Rendered
 */
Template.TestResultStepLog.rendered = function () {
  console.log("TestResultStepLog.rendered: ", Date.now() - this.startTime);
  let instance = Template.instance();
  instance.autorun(function () {
    var resize = Session.get("resize");
    if(resize.width){
      instance.maxLogWidth.set(parseInt(resize.width / 3));
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestResultStepLog.destroyed = function () {
  
};

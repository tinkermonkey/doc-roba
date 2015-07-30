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
  this.startTime = Date.now();
  this.maxLogWidth = new ReactiveVar(parseInt(window.innerWidth / 3));
};

/**
 * Template Rendered
 */
Template.TestStepResultLog.rendered = function () {
  console.log("TestStepResultLog.rendered: ", Date.now() - this.startTime);
  var instance = this;
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
Template.TestStepResultLog.destroyed = function () {
  
};

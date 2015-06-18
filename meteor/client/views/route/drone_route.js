/**
 * Template Helpers
 */
Template.DroneRoute.helpers({
  getVarDataKey: function () {
    var variable = this,
        step = Template.parentData(1);

    return "step" + step.stepNum + "." + variable.name
  },
  getVarValue: function () {
    var variable = this,
      step = Template.parentData(1),
      dataContext = Template.parentData(3).dataContext.get();

    return dataContext["step" + step.stepNum][variable.name]
  }
});

/**
 * Template Event Handlers
 */
Template.DroneRoute.events({});

/**
 * Template Created
 */
Template.DroneRoute.created = function () {
  
};

/**
 * Template Rendered
 */
Template.DroneRoute.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.DroneRoute.destroyed = function () {
  
};

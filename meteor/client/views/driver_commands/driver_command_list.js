/**
 * Template Helpers
 */
Template.DriverCommandList.helpers({
  commands: function () {
    return Collections.DriverCommands.find({}, {sort: {type: 1, name: 1}})
  }
});

/**
 * Template Event Handlers
 */
Template.DriverCommandList.events({});

/**
 * Template Created
 */
Template.DriverCommandList.created = function () {
  var instance = this;

  instance.autorun(function () {
    instance.subscribe("driver_commands");
  });
};

/**
 * Template Rendered
 */
Template.DriverCommandList.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.DriverCommandList.destroyed = function () {
  
};

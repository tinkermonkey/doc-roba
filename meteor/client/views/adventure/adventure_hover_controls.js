/**
 * Template Helpers
 */
Template.AdventureHoverControls.helpers({});

/**
 * Template Helpers
 */
Template.AdventureHoverControls.events({
  "click .btn-left-click, click .btn-right-click": function (e, instance) {
    var element = instance.data.controlledElement,
      command = $(e.target).closest(".btn").attr("data-command"),
      selector = Util.getHighlightedElementSelector(element);

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      console.log("click ignored: adventure is complete");
      return;
    }

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      code: "driver." + command + "(\"" + selector + "\");"
    }, function (error) {
      if(error){
        Meteor.log.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  "click .btn-hover": function (e, instance) {
    var element = instance.data.controlledElement,
      selector = Util.getHighlightedElementSelector(element);

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      console.log("click ignored: adventure is complete");
      return;
    }

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      code: "var el = driver.element(\"" + selector + "\"); driver.moveTo(el.ELEMENT);"
    }, function (error) {
      if(error){
        Meteor.log.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  "click .btn-type": function (e, instance) {
    instance.$(".hidden-editable").editable("show");
  }
});

/**
 * Template Rendered
 */
Template.AdventureHoverControls.rendered = function () {
  var instance = Template.instance();
  instance.$(".hidden-editable").editable({
    mode: "popup",
    value: "",
    emptyText: "",
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      var element = instance.data.controlledElement,
        selector = Util.getHighlightedElementSelector(element);
      AdventureCommands.insert({
        projectId: instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code: "driver.setValue(\"" + selector + "\", \"" + newValue + "\");"
      }, function (error) {
        instance.$(".hidden-editable").editable("setValue", "");
        if(error){
          Meteor.log.error("Error adding adventure command: " + error.message);
          Dialog.error("Error adding adventure command: " + error.message);
        }
      });
    }
  });

};

/**
 * Template Destroyed
 */
Template.AdventureHoverControls.destroyed = function () {

};

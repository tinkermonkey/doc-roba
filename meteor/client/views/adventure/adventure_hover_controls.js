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
      selector;

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // use a validated selector if one exists
    if(element.selectors && element.selectors.length){
      selector = Util.escapeDoubleQuotes(element.selectors[0].selector);
    } else {
      selector = Util.getHighlightedElementSelector(element);
    }

    // send the command to clear all of the highlighted elements
    if(selector){
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
    } else {
      Meteor.log.error("Hover Controls click, no selector found");
      console.log("element: ", element);
    }
  },
  "click .btn-hover": function (e, instance) {
    var element = instance.data.controlledElement,
      selector;

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // use a validated selector if one exists
    if(element.selectors && element.selectors.length){
      selector = Util.escapeDoubleQuotes(element.selectors[0].selector);
    } else {
      selector = Util.getHighlightedElementSelector(element);
    }

    // send the command to clear all of the highlighted elements
    if(selector){
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
    } else {
      Meteor.log.error("Hover Controls hover, no selector found");
      console.log("element: ", element);
    }
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
        selector;

      if(element.selectors && element.selectors.length){
        selector = Util.escapeDoubleQuotes(element.selectors[0].selector);
      } else {
        selector = Util.getHighlightedElementSelector(element);
      }

      if(selector){
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
      } else {
        Meteor.log.error("Hover Controls type, no selector found");
        console.log("element: ", element);
      }
    }
  });

};

/**
 * Template Destroyed
 */
Template.AdventureHoverControls.destroyed = function () {

};

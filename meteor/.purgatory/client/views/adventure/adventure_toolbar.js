/**
 * Template Helpers
 */
Template.AdventureToolbar.helpers({
  getXPath: function () {
    if(this.selectorElements){
      var elements = this.selectorElements.get(),
        xPath = "",
        element, previousElement;
      _.each(_.keys(elements), function (key) {
        element = elements[key];

        // start the xPath
        if(previousElement && previousElement.index == element.index - 1){
          xPath += "/"
        } else {
          xPath += "//"
        }

        // set the tag selector
        if(element.tag){
          xPath += element.tag
        } else {
          xPath += "*"
        }

        // set the attributes
        if(element.attributes.length){
          xPath += "[";
          _.each(element.attributes, function (attribute, i) {
            if(i > 0){
              xPath += " and ";
            }

            if(attribute.attribute == "class"){
              xPath += "contains(@" + attribute.attribute + ",\"" + attribute.value + "\")";
            } else {
              xPath += "@" + attribute.attribute + "=\"" + attribute.value + "\"";
            }
          });
          xPath += "]";
        }

        // store the previous
        previousElement = element;
      });

      return xPath;
    }
  },
  getCurrentNode: function () {
    var nodeId = this.currentNodeId.get();
    if(nodeId){
      return Nodes.findOne({ staticId: nodeId, projectVersionId: this.adventure.projectVersionId });
    }
  },
  getSelector: function () {
    return {selector: Template.instance().selector.get()};
  }
});

/**
 * Template Helpers
 */
Template.AdventureToolbar.events({
  "click .btn-clear": function (e, instance) {
    this.selectorElements.set({});
    this.checkResult.set();
    $(".adventure-highlight-detail").find(".selected").removeClass("selected");
    instance.$(".selector-value").val("");
  },
  "click .btn-refine": function (e, instance) {
    var selector = instance.$(".selector-value").val(),
      lastLocation = this.lastClickLocation.get();

    console.log("Last click location: ", lastLocation);

    if(selector && lastLocation){
      // send the command to clear all of the highlighted elements
      var commandId = AdventureCommands.insert({
        projectId: instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code: "driver.refineSelector(" + lastLocation.x + ", " + lastLocation.y + ", \"" + Util.escapeDoubleQuotes(selector) + "\");"
      }, function (error) {
        if(error){
          console.error("Error adding adventure command: " + error.message);
          Dialog.error("Error adding adventure command: " + error.message);
        } else {
          // wait for the command to return
          var cursor = AdventureCommands.find({_id: commandId}).observe({
            changed: function (newDoc) {
              if(newDoc.status == AdventureStepStatus.complete){
                console.log("Command Complete: ", newDoc.result);
                cursor.stop();
                instance.data.checkResult.set(newDoc.result);
              } else if (newDoc.status == AdventureStepStatus.error) {
                console.log("Command Failed: ", newDoc.result);
                cursor.stop();
              } else {
                console.log("Command status: ", AdventureStepStatusLookup[newDoc.status]);
              }
            }
          });
        }
      });
    }
  },
  "click .btn-highlight": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // get the selector
    var selector = instance.$(".selector-value").val();

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      code: "driver.testSelector(\"" + Util.escapeDoubleQuotes(selector) + "\");"
    }, function (error) {
      if(error){
        console.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  "keyup input.selector-value, change input.selector-value": function (e, instance) {
    var selector = instance.$(".selector-value").val(),
      lastLocation = this.lastClickLocation.get();
    console.log("Selector: ", selector);

    if(selector.length && lastLocation) {
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").removeAttr("disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else if (selector.length){
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").attr("disabled", "disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else {
      instance.$(".btn-clear").attr("disabled", "disabled");
      instance.$(".btn-refine").attr("disabled", "disabled");
      instance.$(".btn-highlight").attr("disabled", "disabled");
      instance.$(".btn-selector-dropdown").attr("disabled", "disabled");
    }
    instance.selector.set(selector);
  },
  /**
   * Click event for the refresh button
   * @param e
   */
  "click .btn-refresh": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: true,
      code: "true"
    }, function (error) {
      if(error){
        console.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  /**
   * Click event for the clear-highlight button
   * @param e
   */
  "click .btn-clear-highlight": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // clear the last click location and check result
    this.lastClickLocation.set();
    this.checkResult.set();

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: false,
      code: "driver.clearHighlight();"
    }, function (error) {
      if(error){
        console.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.AdventureToolbar.created = function () {
  var instance = this;
  instance.selector = new ReactiveVar("");
};

/**
 * Template Rendered
 */
Template.AdventureToolbar.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.AdventureToolbar.destroyed = function () {

};

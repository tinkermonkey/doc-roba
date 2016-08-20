/**
 * Template Helpers
 */
Template.AdventureEditActionForm.helpers({
  // sometimes the action record end up being non-reactive
  getActionRecord: function () {
    return Actions.findOne(this._id);
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditActionForm.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var target = $(e.target),
      dataKey = target.attr("data-key"),
      update = {$set: {}};

    if(dataKey){
      update["$set"][dataKey] = newValue;
      //console.log("Edited: ", dataKey, newValue, update, instance.data);
      Actions.update(instance.data._id, update, function (error) {
        if(error){
          console.error("Failed to update action value: " + error.message);
          RobaDialog.error("Failed to update action value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update action value: data-key not found");
      RobaDialog.error("Failed to update action value: data-key not found");
    }
  }
});

/**
 * Template Created
 */
Template.AdventureEditActionForm.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureEditActionForm.rendered = function () {
  var instance = Template.instance();
  //Tabs.init(instance).activateFirst(instance);
};

/**
 * Template Destroyed
 */
Template.AdventureEditActionForm.destroyed = function () {
  
};

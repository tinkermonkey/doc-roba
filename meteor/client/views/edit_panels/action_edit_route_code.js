/**
 * Template Helpers
 */
Template.action_edit_route_code.helpers({});

/**
 * Template Helpers
 */
Template.action_edit_route_code.events({});

/**
 * Template Rendered
 */
Template.action_edit_route_code.rendered = function () {
  var instance = Template.instance(),
    action = Template.parentData(1),
    route = instance.data;
  //console.log("Route: ", route);

  // setup the action editor
  if(!instance.editor){
    var editor = instance.editor = ace.edit("action-route-editor-" + action._id + "-" + route.index);
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setValue(route.routeCode);
    editor.clearSelection();
    editor.moveCursorTo(0,0);
    editor.focus();

    editor.getSession().on('change', function () {
      if(action._id){
        if(editor.saveTimeout){
          Meteor.clearTimeout(editor.saveTimeout);
        }
        editor.saveTimeout = Meteor.setTimeout(function () {
          //console.debug("Saving action code: " + route._id);
          var routeKey = "routes." + route.index + ".routeCode",
            update = {$set: {}};
          update["$set"][routeKey] = editor.getValue();
          Collections.Actions.update(action._id, update, function (error, response) {
            if(error){
              console.error("Failed to save route code: " + error.message);
            } else {
              console.debug("Route code saved: " + JSON.stringify(update));
            }
          });
        }, 1000);
      } else {
        console.error("Error saving action code, no _id found: ", route);
      }
    });
  } else {
    console.info("Updating the value of the action code");
    instance.editor.setValue(route.routeCode);
  }
};

/**
 * Template Destroyed
 */
Template.action_edit_route_code.destroyed = function () {

};

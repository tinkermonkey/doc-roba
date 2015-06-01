/**
 * Template Helpers
 */
Template.action_edit_code.helpers({});

/**
 * Template Helpers
 */
Template.action_edit_code.events({});

/**
 * Template Rendered
 */
Template.action_edit_code.rendered = function () {
  var instance = Template.instance(),
    record = instance.data;

  // setup the action editor
  if(!instance.editor){
    var editor = instance.editor = ace.edit("action-editor-" + record._id);
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setValue(record.code);
    editor.clearSelection();
    editor.moveCursorTo(0,0);
    editor.focus();

    editor.getSession().on('change', function () {
      if(record._id){
        if(editor.saveTimeout){
          Meteor.clearTimeout(editor.saveTimeout);
        }
        editor.saveTimeout = Meteor.setTimeout(function () {
          //Meteor.log.debug("Saving action code: " + record._id);
          Actions.update(record._id, {$set: {code: editor.getValue() }});
        }, 1000);
      } else {
        Meteor.log.error("Error saving action code, no _id found: ", record);
      }
    });

    // resize the editor on expand/collapse
    instance.autorun(function () {
      Session.get("resize");
      Session.get("drawerExpanded");
      setTimeout( function () {
        instance.editor.resize(true);
      }, 125);
    });
  } else {
    Meteor.log.info("Updating the value of the action code");
    instance.editor.setValue(action.code);
  }
};

/**
 * Template Destroyed
 */
Template.action_edit_code.destroyed = function () {

};

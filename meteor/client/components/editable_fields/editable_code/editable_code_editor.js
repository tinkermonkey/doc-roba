/**
 * Template Helpers
 */
Template.EditableCodeEditor.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableCodeEditor.events({});

/**
 * Template Created
 */
Template.EditableCodeEditor.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableCodeEditor.rendered = function () {
  var instance = this;
  if(!instance.editor) {
    console.log("Creating editor:", instance.data);
    var editor = instance.editor = ace.edit(instance._elementId);
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWrapMode(true);
    editor.setValue(instance.data.value || "");
    editor.clearSelection();
    editor.moveCursorTo(0, 0);

    if(instance.data.maxLines){
      editor.setOption("maxLines", instance.data.maxLines);
    }

    if(instance.data.minLines){
      editor.setOption("minLines", instance.data.minLines);
    }

    // Setup the autocomplete
    ace.config.loadModule("ace/ext/language_tools", function () {
      var langTools = ace.require("ace/ext/language_tools");
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      langTools.addCompleter(futureDriverCompleter);
    });
  }
};

/**
 * Template Destroyed
 */
Template.EditableCodeEditor.destroyed = function () {
  
};

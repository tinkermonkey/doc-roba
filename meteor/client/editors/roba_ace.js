/**
 * RobaAce
 *
 * Created by austinsand on 3/29/15
 *
 */

/**
 * Template Helpers
 */
Template.RobaAce.helpers({});

/**
 * Template Event Handlers
 */
Template.RobaAce.events({});

/**
 * Template Created
 */
Template.RobaAce.created = function () {

};

/**
 * Template Rendered
 */
Template.RobaAce.rendered = function () {
  var instance = this;
  if(!instance.editor) {
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

    // Setup edit events
    editor.getSession().on('change', function (change, editor) {
      if(instance.updateTimeout){
        clearTimeout(instance.updateTimeout);
      }
      instance.updateTimeout = setTimeout(function () {
        $("#" + instance._elementId).trigger("edited", [editor.getValue()]);
      }, 1000);
    });

    // resize the editor on expand/collapse
    instance.autorun(function () {
      Session.get("resize");
      setTimeout( function () {
        instance.editor.resize(true);
      }, 125);
    });

    // respond to data updates
    instance.autorun(function () {
      var data = Template.currentData();
      if(data.value !== instance.editor.getValue()){
        console.log("Data update");
        instance.editor.setValue(data.value);
        instance.editor.clearSelection();
      }
    });
  }
};

/**
 * Template Destroyed
 */
Template.RobaAce.destroyed = function () {

};

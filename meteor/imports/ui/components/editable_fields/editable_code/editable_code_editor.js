import './editable_code_editor.html';

import {Template} from 'meteor/templating';
import 'meteor/dcsan:reactive-ace';

import {RobaCompleter} from '../../ace_editor/roba_ace_autocomplete.js';

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
    //console.log("Creating editor:", instance.data);

    var editor = instance.editor = ace.edit(instance.elementId);
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

      langTools.addCompleter(RobaCompleter);
    });

    // give the editor focus
    setTimeout(function () {
      editor.focus();
    }, 100);
  }
};

/**
 * Template Destroyed
 */
Template.EditableCodeEditor.destroyed = function () {
  console.log("EditableCodeEditor.destroyed");
};

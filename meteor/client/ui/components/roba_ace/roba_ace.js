import './roba_ace.html';
import './roba_ace.css';
import { Template } from 'meteor/templating';
import '../../../../node_modules/ace-builds/src/ace.js';
import { RobaCompleter } from './roba_ace_autocomplete.js';

/**
 * Template Helpers
 */
Template.RobaAce.helpers({});

/**
 * Template Event Handlers
 */
Template.RobaAce.events({
  "click .btn-fullscreen"(e, instance){
    if (instance.inXEditable) {
      let popover = instance.$(instance.firstNode).closest(".popover-content"),
          isFill  = popover.hasClass("fill-left") || popover.hasClass("fill-right");
      
      popover.removeClass("fill-left");
      popover.removeClass("fill-right");
      
      if (popover.hasClass("roba-ace-fullscreen") && !isFill) {
        popover.removeClass("roba-ace-fullscreen");
        instance.exitFullscreen(popover);
      } else {
        popover.addClass("roba-ace-fullscreen");
        instance.enterFullscreen(popover);
      }
    } else {
      
    }
  },
  "click .btn-fill-left"(e, instance){
    if (instance.inXEditable) {
      let popover      = instance.$(instance.firstNode).closest(".popover-content"),
          isFullscreen = popover.hasClass("roba-ace-fullscreen"),
          isFillLeft   = popover.hasClass("fill-left");
      
      popover.removeClass("fill-right");
      
      if (isFullscreen && isFillLeft) {
        popover.removeClass("roba-ace-fullscreen");
        popover.removeClass("fill-left");
        instance.exitFullscreen(popover);
      } else {
        popover.addClass("roba-ace-fullscreen");
        popover.addClass("fill-left");
        instance.enterFullscreen(popover);
      }
    } else {
      
    }
  },
  "click .btn-fill-right"(e, instance){
    if (instance.inXEditable) {
      let popover      = instance.$(instance.firstNode).closest(".popover-content"),
          isFullscreen = popover.hasClass("roba-ace-fullscreen"),
          isFillRight  = popover.hasClass("fill-right");
      
      popover.removeClass("fill-left");
      
      if (isFullscreen && isFillRight) {
        popover.removeClass("roba-ace-fullscreen");
        popover.removeClass("fill-right");
        instance.exitFullscreen(popover);
      } else {
        popover.addClass("roba-ace-fullscreen");
        popover.addClass("fill-right");
        instance.enterFullscreen(popover);
      }
    } else {
      
    }
  }
  
});

/**
 * Template Created
 */
Template.RobaAce.created = function () {
  let self = Template.instance();
  
  self.enterFullscreen = function (popover) {
    let instance = this;
    
    // cache the current size
    if (!instance.restoreWidth) {
      instance.restoreWidth = popover.find(".roba-ace").width();
    }
    if (!instance.restoreHeight) {
      instance.restoreHeight = popover.find(".roba-ace").height();
    }
    
    // measure the container
    let width         = popover.width(),
        height        = popover.height(),
        toolbarHeight = popover.find(".roba-ace-toolbar").height(),
        buttonWidth   = popover.find(".control-group").width() - popover.find(".x-editable-ace").width();
    
    // fill the space
    popover.find(".roba-ace").width(width - buttonWidth).height(height - toolbarHeight);
    instance.editor && instance.editor.resize(true);
  };
  
  self.exitFullscreen = function (popover) {
    let instance = this;
    if (instance.restoreWidth && instance.restoreHeight) {
      popover.find(".roba-ace").width(instance.restoreWidth).height(instance.restoreHeight);
    }
    instance.editor && instance.editor.resize(true);
  };
};

/**
 * Template Rendered
 */
Template.RobaAce.rendered = function () {
  let self         = Template.instance();
  self.inXEditable = $(self.firstNode).closest(".editableform").get(0) != null;
  
  if (self.inXEditable) {
    let popover = self.$(self.firstNode).closest(".popover-content");
    if (popover.hasClass("roba-ace-fullscreen")) {
      self.enterFullscreen(popover);
    } else {
      self.exitFullscreen(popover);
    }
  } else {
    
  }
  
  if (!self.editor) {
    ace.config.set('basePath', '/ace-editor');
    let editor = self.editor = ace.edit(self.elementId);
    editor.$blockScrolling            = Infinity;
    editor.container.style.lineHeight = "1.45";
    editor.setOption("fontSize", "14px");
    editor.setOption("fontFamily", "Menlo, Monaco, Consolas, 'Courier New', monospace");
    editor.setTheme("ace/theme/docroba");
    editor.getSession().setMode("ace/mode/" + (self.data.mode || "javascript"));
    editor.getSession().setUseWrapMode(true);
    editor.setValue(self.data.value || "");
    editor.clearSelection();
    editor.moveCursorTo(0, 0);
    
    if (self.data.maxLines) {
      editor.setOption("maxLines", self.data.maxLines);
    }
    
    if (self.data.minLines) {
      editor.setOption("minLines", self.data.minLines);
    }
    
    // Setup the autocomplete
    ace.config.loadModule("ace/ext/language_tools", function () {
      let langTools = ace.require("ace/ext/language_tools");
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion : true
      });
      
      langTools.addCompleter(RobaCompleter);
    });
    
    // give the editor focus
    setTimeout(function () {
      editor.focus();
    }, 100);
    
    // If this is part of an x_editable control, don't publish live events
    if (!self.inXEditable) {
      // Setup firing of edited events on a buffer
      editor.getSession().on('change', function (change, editor) {
        clearTimeout(self.updateTimeout);
        self.updateTimeout = setTimeout(function () {
          $("#" + self.elementId).trigger("edited", [ editor.getValue() || "" ]);
        }, 1000);
      });
    }
    
    // resize the editor on expand/collapse
    self.autorun(function () {
      Session.get("resize");
      setTimeout(function () {
        self.editor.resize(true);
      }, 125);
    });
    
    // respond to data updates
    self.autorun(function () {
      let data = Template.currentData();
      if (data.value !== self.editor.getValue()) {
        console.debug("RobaAce Data update:", data.value);
        self.editor.setValue(data.value || '');
        self.editor.clearSelection();
      }
    });
  }
};

/**
 * Template Destroyed
 */
Template.RobaAce.onDestroyed(() => {
  let self = Template.instance();
  self.editor.destroy();
});

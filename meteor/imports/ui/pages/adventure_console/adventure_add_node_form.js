import './adventure_add_node_form.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { NodeTypes } from '../../../api/node/node_types.js';
import '../../components/editable_fields/node_selector/editable_node_selector.js';
import '../../components/editable_fields/editable_node_type.js';
import '../../components/edit_panels/edit_node_url_parameters.js';

/**
 * Template Helpers
 */
Template.AdventureAddNodeForm.helpers({
  record () {
    return Template.instance().nodeRecord.get();
  },
  splitUrl () {
    if (this.state && this.state.url) {
      var pieces = [];
      _.each(Util.urlPath(this.state.url).split("/"), function (part, i) {
        if (part.length) {
          pieces.push({
            index: i,
            value: part
          });
        }
      });
      return pieces;
    }
  },
  splitParams () {
    
  },
  splitTitle () {
    if (this.state && this.state.title) {
      var pieces = [];
      _.each(this.state.title.split(/\s/), function (part, i) {
        if (part.trim().length) {
          pieces.push({
            index: i,
            value: part
          });
        }
      });
      return pieces;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureAddNodeForm.events({
  "click .url-part.clickable" (e, instance) {
    $(e.target).toggleClass("selected");
    
    var selection = [], oneSelected = false;
    instance.$(".url-part").each(function (i, part) {
      selection.push($(part).hasClass("selected") ? $(part).attr("data-value") : "*");
      oneSelected = oneSelected || $(part).hasClass("selected");
    });
    
    if (!oneSelected) {
      selection = [];
    }
    
    var record = instance.nodeRecord.get();
    record.url = selection.length ? "/" + selection.join("/") : null;
    instance.nodeRecord.set(record);
  },
  "click .title-part.clickable" (e, instance) {
    $(e.target).toggleClass("selected");
    
    var selection = [], oneSelected = false, selected, lastSelected = true;
    instance.$(".title-part").each(function (i, part) {
      selected = $(part).hasClass("selected");
      if (selected || lastSelected) {
        selection.push(selected ? $(part).attr("data-value") : "*");
      }
      oneSelected  = oneSelected || selected;
      lastSelected = selected;
    });
    
    if (!oneSelected) {
      selection = [];
    }
    
    var record       = instance.nodeRecord.get();
    record.pageTitle = selection.join(" ");
    instance.nodeRecord.set(record);
  },
  "click .url-param.clickable" (e, instance) {
    $(e.target).toggleClass("selected");
    
    var selection = [];
    instance.$(".param-part").each(function (i, part) {
      //console.log("url-part: ", i, $(part).attr("data-value"), $(part).hasClass("selected"));
      selection.push({
        order: i,
        value: $(part).hasClass("selected") ? $(part).attr("data-value") : null
      });
    });
    
    var record       = instance.nodeRecord.get();
    record.urlParams = selection;
    instance.nodeRecord.set(record);
  },
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var field = $(e.target).attr("data-key");
    console.log("Edited: ", field, newValue);
    
    var record      = instance.nodeRecord.get();
    record[ field ] = newValue;
    instance.nodeRecord.set(record);
    
    if (field == "url") {
      instance.$(".url-part").removeClass("selected");
    } else if (field == "pageTitle") {
      instance.$(".title-part").removeClass("selected");
    }
  }
});

/**
 * Template Created
 */
Template.AdventureAddNodeForm.onCreated(() => {
  let instance = Template.instance();
  
  // Use this construct to build up the new node record
  instance.nodeRecord = new ReactiveVar({
    parentId        : instance.data.adventure.lastKnownNode,
    projectId       : instance.data.adventure.projectId,
    projectVersionId: instance.data.adventure.projectVersionId,
    type            : NodeTypes.page,
    title           : "",
    pageTitle       : "",
    url             : "",
    urlParams       : []
  });
});

/**
 * Template Rendered
 */
Template.AdventureAddNodeForm.onRendered(() => {
  var instance = Template.instance();
  
  instance.autorun(function () {
    var record  = instance.nodeRecord.get(),
        visible = $(instance.firstNode).is(":visible");
    if (record.parentId && visible) {
      try {
        console.log("AddNodeForm autoRun");
        var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance();
        mapInstance.mapLayout.highlightNodes([ record.parentId ]);
      } catch (e) {
        console.error("Failed to locate map container: " + e.message);
      }
    }
  });
});

/**
 * Template Destroyed
 */
Template.AdventureAddNodeForm.onDestroyed(() => {
  
});

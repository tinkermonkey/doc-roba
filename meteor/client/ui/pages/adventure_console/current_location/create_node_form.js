import './create_node_form.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../../imports/api/nodes/nodes.js';
import { NodeTypes } from '../../../../../imports/api/nodes/node_types.js';
import { Util } from '../../../../../imports/api/util.js';
import '../../../components/editable_fields/node_selector/editable_node_selector.js';
import '../../../components/editable_fields/editable_node_type.js';

/**
 * Template Helpers
 */
Template.CreateNodeForm.helpers({
  record () {
    return Template.instance().nodeRecord.get();
  },
  splitUrl () {
    let state = this.state.get();
    if (state && state.url) {
      var pieces = [];
      _.each(Util.urlPath(state.url).split("/"), function (part, i) {
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
    let state = this.state.get();
    if (state && state.title) {
      var pieces = [];
      _.each(state.title.split(/\s/), function (part, i) {
        if (part.trim().length) {
          pieces.push({
            index: i,
            value: part
          });
        }
      });
      return pieces;
    }
  },
  createNodePanel(){
    let adventure = this.adventure.get(),
        platform  = adventure.platform();
    if (platform) {
      let platformType = platform.platformType();
      if (platformType) {
        return platformType.templates.addNode;
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CreateNodeForm.events({
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
    var field  = $(e.target).attr("data-key"),
        record = instance.nodeRecord.get();
    console.log("CreateNodeForm edited: ", field, newValue);
    
    if (field && record) {
      record[ field ] = newValue;
      instance.nodeRecord.set(record);
      
      if (field == "url") {
        instance.$(".url-part").removeClass("selected");
      } else if (field == "pageTitle") {
        instance.$(".title-part").removeClass("selected");
      }
    }
  },
  
  /**
   * Cancel the create node form and discard the data
   * @param e
   * @param instance
   */
  "click .btn-cancel-node" (e, instance) {
    // Hide the form
    instance.$(".create-node-form").addClass("hide");
    
    // Show the buttons
    instance.$(".btn-add-node").removeClass("hide");
    
    // Show the search results
    //instance.$(".node-url-search").removeClass("hide");
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
          finalWidth  = mapInstance.$(".map-tree-base").closest(".row").width() / 3,
          finalHeight = mapInstance.$(".map-tree-base").height();
      //mapInstance.mapLayout.transitionZoomAll(finalWidth, finalHeight, 250);
      mapInstance.mapLayout.clearHighlight();
      setTimeout(function () {
        mapInstance.mapLayout.zoomAll(250);
      }, 250);
    } catch (e) {
      console.error("Failed to locate map container: " + e.message);
    }
  },
  
  /**
   * Create a new node
   * @param e
   * @param instance
   */
  "click .btn-create-node" (e, instance) {
    var record = instance.nodeRecord.get();
    console.log('CreateNodeForm click btn-create-node:', record);
    
    if (record && record.parentId && record.title && record.title.length) {
      // Get the parent node to figure out the platform and user type
      var parent = Nodes.findOne({ staticId: record.parentId, projectVersionId: record.projectVersionId });
      if (parent) {
        record.userTypeId = parent.userTypeId;
        record.platformId = parent.platformId;
  
        console.log("CreateNodeForm inserting node:", record);
        
        // create the record
        Nodes.insert(record, (error, nodeId) => {
          if(error){
            RobaDialog.error("Create node failed: " + error.message);
          } else {
            console.log("Record Created:", nodeId);
            
            // Set the current node on the adventure context to reset the view
            instance.data.currentNodeId.set(nodeId);
          }
        });
      } else {
        RobaDialog.error("Create node failed: could not find parent node " + record.parentId + " for project " + record.projectVersionId);
      }
    } else if (!record.parentId) {
      RobaDialog.error("Please select a parent node for this node");
    } else if (!record.title) {
      RobaDialog.error("Please enter a name for this node");
    }
  },
});

/**
 * Template Created
 */
Template.CreateNodeForm.onCreated(() => {
  let instance  = Template.instance(),
      adventure = instance.data.adventure.get();
  
  if (adventure) {
    instance.nodeRecord = new ReactiveVar({
      parentId        : adventure.lastKnownNode,
      projectId       : adventure.projectId,
      projectVersionId: adventure.projectVersionId,
      type            : NodeTypes.page,
      title           : "",
      pageTitle       : "",
      url             : "",
      urlParams       : []
    });
  } else {
    console.error('CreateNodeForm has no adventure in context:', instance.data)
  }
});

/**
 * Template Rendered
 */
Template.CreateNodeForm.onRendered(() => {
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
        console.error("Failed to locate map container:", e.message);
      }
    }
  });
});

/**
 * Template Destroyed
 */
Template.CreateNodeForm.onDestroyed(() => {
  
});

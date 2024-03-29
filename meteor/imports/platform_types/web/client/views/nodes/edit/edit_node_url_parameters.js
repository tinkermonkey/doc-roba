import './edit_node_url_parameters.html';
import './edit_node_url_parameters.css';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Nodes } from '../../../../../../api/nodes/nodes.js';
import './edit_node_url_parameter_list.js';

/**
 * Template Helpers
 */
Template.EditNodeUrlParameters.helpers({});

/**
 * Template Helpers
 */
Template.EditNodeUrlParameters.events({
  "click .btn-add-url-parameter"(e, instance) {
    var node = this;
    Nodes.update(instance.data._id, {
      $push: {
        urlParameters: {
          order: node.urlParameters ? node.urlParameters.length : 0,
          param: "parameter",
          value: "value"
        }
      }
    }, function (error) {
      if (error) {
        console.error("Failed to add node url parameter: " + error.message);
        RobaDialog.error("Failed to add node url parameter: " + error.message);
      }
    });
  },
  "click .node-url-parameter .btn-delete"(e, instance) {
    var parameter = this,
        index     = $(e.target).closest(".node-url-parameter").attr("data-index");
    
    RobaDialog.show({
      title  : "Delete Parameter?",
      text   : "Are you sure you want to delete the identifying url parameter <span class='label label-primary'>" + parameter.param + "</span> from this node?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        //console.log("Dialog button pressed: ", btn);
        if (btn == "Delete") {
          Nodes.update(instance.data._id, { $pull: { urlParameters: { order: parameter.order } } }, function (error) {
            RobaDialog.hide();
            if (error) {
              console.error("Delete failed: " + error.message);
              RobaDialog.error("Delete failed: " + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.EditNodeUrlParameters.rendered = function () {
  var instance = Template.instance();
  
  // Make the field list sortable
  instance.$(".sortable-table")
      .sortable({
        items : "> tbody > .sortable-table-row",
        handle: ".drag-handle",
        helper(e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis  : "y",
        update(event, ui) {
          var update = { $set: {} },
              updateKey;
          
          instance.$(".node-url-parameter").each(function (i, el) {
            updateKey                     = "urlParameters." + parseInt($(el).attr("data-index")) + ".order";
            update[ "$set" ][ updateKey ] = i;
          });
          
          console.log("Update pre-send: ", instance.data._id, update);
          Nodes.update(instance.data._id, update, function (error) {
            if (error) {
              console.error("Node url parameter order update failed: " + error.message);
              RobaDialog.error("Node url parameter order update failed: " + error.message);
            }
          });
          
          instance.$(".sortable-table").sortable("cancel");
        }
      })
      .disableSelection();
};

/**
 * Template Destroyed
 */
Template.EditNodeUrlParameters.destroyed = function () {
  
};

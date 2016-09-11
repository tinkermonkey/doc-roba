import './version_test_agent_list.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';
import {EditableTextField} from 'meteor/austinsand:editable-text-field';

import {TestAgents} from '../../../../../../imports/api/test_agent/test_agent.js';
import {TestAgentTypes} from '../../../../../../imports/api/test_agent/test_agent_types.js';
import {TestAgentOS} from '../../../../../../imports/api/test_agent/test_agent_os.js';

import '../../../../components/editable_fields/editable_test_agent_type.js';
import '../../../../components/editable_fields/editable_test_agent_os.js';

/**
 * Template Helpers
 */
Template.VersionTestAgentList.helpers({
  sortedTestAgents() {
    return TestAgents.find({projectVersionId: this._id}, {sort: {order: 1}}).fetch();
  }
});

/**
 * Template Event Handlers
 */
Template.VersionTestAgentList.events({
  "click .btn-add-test-agent"(e, instance) {
    var order = instance.$(".sortable-table-row").length,
        projectVersion = this;

    TestAgents.insert({
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion._id,
      type: TestAgentTypes.selenium,
      os: TestAgentOS.Windows,
      title: "Some Browser",
      order: order
    }, function (error, response) {
      if(error){
        console.error("Insert failed: ", error);
        RobaDialog.error("Insert failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".sortable-table-row[data-pk='" + response + "']").find(".editable[data-key='type']").editable("show");
        }, 250);
      }
    });
  },
  "click .sortable-table-row .btn-delete"() {
    var testAgent = this;

    RobaDialog.show({
      title: "Delete Test Agent Config?",
      text: "Are you sure that you want to delete the test agent configuration for this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback(btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          TestAgents.remove(testAgent._id, function (error, response) {
            RobaDialog.hide();
            if(error){
              console.error("Delete failed: ", error);
              RobaDialog.error("Delete failed: " + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "edited .editable"(e, instance, newValue) {
    e.stopImmediatePropagation();
    
    var testAgentId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;
    TestAgents.update(testAgentId, update, function (error) {
      if(error){
        console.error("Test Agent update failed: ", error);
        RobaDialog.error("Test Agent update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.VersionTestAgentList.rendered = function () {
  var instance = Template.instance();

  instance.$(".sortable-table")
    .sortable({
      items: "> .sortable-table-row",
      handle: ".drag-handle",
      helper(e, ui) {
        // fix the width
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui;
      },
      axis: "y",
      forcePlaceholderSize: true,
      update(event, ui) {
        var order;
        instance.$(".sortable-table-row").each(function (i, el) {
          order = $(el).attr("data-sort-order");
          if(order != i){
            console.log("Updating order: ", i, $(el).attr("data-pk"));
            TestAgents.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
              if(error){
                console.error("Test Agent order update failed: ", error);
                RobaDialog.error("Test Agent order update failed: " + error.message);
              }
            });
          }
        });
      }
    })
    .disableSelection();
};

/**
 * Template Destroyed
 */
Template.VersionTestAgentList.destroyed = function () {

};

import './version_test_system_list.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { EditableTextField } from 'meteor/austinsand:editable-text-field';
import { TestSystems } from '../../../../../../imports/api/test_system/test_system.js';
import { TestAgentTypes } from '../../../../../../imports/api/test_agent/test_agent_types.js';
import '../../../../components/editable_fields/editable_checkbox.js';
import '../../../../components/editable_fields/editable_test_agent_type.js';
import '../../../../components/editable_fields/editable_test_agent_list.js';

/**
 * Template Helpers
 */
Template.VersionTestSystemList.helpers({
  sortedTestSystems() {
    return TestSystems.find({ projectVersionId: this._id }, { sort: { order: 1 } }).fetch();
  }
});

/**
 * Template Helpers
 */
Template.VersionTestSystemList.events({
  "click .btn-add-test-system"(e, instance) {
    var order          = instance.$(".sortable-table-row").length,
        projectVersion = this;
    
    TestSystems.insert({
      projectId       : projectVersion.projectId,
      projectVersionId: projectVersion._id,
      title           : "New Test System",
      type            : TestAgentTypes.selenium,
      hostname        : "test.test.com",
      port            : "4444",
      active          : true,
      order           : order
    }, function (error, response) {
      if (error) {
        RobaDialog.error("Insert failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".sortable-table-row[data-pk='" + response + "'] .editable[data-key='title']").editable("show");
        }, 250);
      }
    });
  },
  "click .sortable-table-row .btn-delete"(e, instance) {
    var testSystem = this;
    
    RobaDialog.show({
      title  : "Delete Test System Configuration?",
      text   : "Are you sure that you want to delete the test system configuration <span class='label label-primary'>" + testSystem.title + "</span> from this version?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        //console.log("Dialog button pressed: ", btn);
        if (btn == "Delete") {
          TestSystems.remove(testSystem._id, function (error, response) {
            RobaDialog.hide();
            if (error) {
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
    var testSystemId            = $(e.target).closest(".sortable-table-row").attr("data-pk"),
        dataKey                 = $(e.target).attr("data-key"),
        update                  = { $set: {} };
    update[ "$set" ][ dataKey ] = newValue;
    TestSystems.update(testSystemId, update, function (error) {
      if (error) {
        RobaDialog.error("Test System update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.VersionTestSystemList.rendered = function () {
  var instance = Template.instance();
  
  instance.$(".sortable-table")
      .sortable({
        items               : "> .sortable-table-row",
        handle              : ".drag-handle",
        helper(e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : "y",
        forcePlaceholderSize: true,
        update(event, ui) {
          var order;
          instance.$(".sortable-table-row").each(function (i, el) {
            order = $(el).attr("data-sort-order");
            if (order != i) {
              console.log("Updating order: ", i, $(el).attr("data-pk"));
              TestSystems.update($(el).attr("data-pk"), { $set: { order: i } }, function (error, response) {
                if (error) {
                  RobaDialog.error("Test System order update failed: " + error.message);
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
Template.VersionTestSystemList.destroyed = function () {
  
};

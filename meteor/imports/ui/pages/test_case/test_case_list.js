import './test_case_list.html';

import {Blaze} from 'meteor/blaze';
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';

import {TestCases} from '../../../api/test_case/test_case.js';
import {TestGroups} from '../../../api/test_case/test_group.js'

import './test_case_list_group.js';
import './test_case_list_item.js';

/**
 * Template Helpers
 */
Template.TestCaseList.helpers({
  baseGroups: function () {
    return TestGroups.find({ parentGroupId: null, projectVersionId: FlowRouter.getParam("projectVersionId") }, { sort: { title: 1 } });
  },
  baseTestCases: function () {
    return TestCases.find({ testGroupId: null, projectVersionId: FlowRouter.getParam("projectVersionId") }, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseList.events({
  "keyup .add-item-form input": function (e, instance) {
    var value = $(e.target).val();

    if(e.which == 13 && value.length >= 2){
      //instance.$(".add-item-form .dropdown-toggle").trigger("click");
      // Search for the entered text
      instance.$(".add-item-form .btn-search").trigger("click");
    } else if(value.length >= 2){
      if(instance.$(".add-item-form .btn-add-item").attr("disabled")){
        instance.$(".add-item-form .btn-add-item").removeAttr("disabled");
      }
      if(instance.$(".add-item-form .btn-search").attr("disabled")){
        instance.$(".add-item-form .btn-search").removeAttr("disabled");
      }
    } else {
      instance.$(".add-item-form .btn-add-item").attr("disabled", "disabled");
      instance.$(".add-item-form .btn-search").attr("disabled", "disabled");
    }
  },
  "click .btn-search": function (e, instance) {
    var search = instance.$(".add-item-form input").val(),
        projectVersionId = FlowRouter.getParam("projectVersionId");

    if(search.length < 2){
      return;
    }

    if(!projectVersionId){
      console.error("Search failed: no project version id found");
    }

    // show the clear button
    instance.$(".field-clear-btn").show();

    // hide everything from the list
    instance.$(".test-case-list-selectable").hide();

    // show everything that matches the search
    var highlight = function (item) {
      var item = instance.$(".test-case-list-selectable[data-pk='" + item._id + "']");
      item.show().addClass("highlight");
      item.parents(".test-case-list-group-items").each(function (i, el) {
        var parentInstance = Blaze.getView(el).templateInstance();
        if(parentInstance.expanded){
          parentInstance.$(".test-case-list-selectable").first().show();
          parentInstance.expanded.set(true);
        }
      });
    };
    TestCases.find({ title: {$regex: search, $options: "i"}, projectVersionId: projectVersionId }).forEach(highlight);
    TestGroups.find({ title: {$regex: search, $options: "i"}, projectVersionId: projectVersionId }).forEach(highlight);

    // show no results if nothing matched
    if(!instance.$(".test-case-list-selectable.highlight").length){
      instance.$(".search-no-results").show();
    }
  },
  "click .field-clear-btn": function (e, instance) {
    instance.$(".add-item-form input").val("");
    instance.$(".field-clear-btn").hide();
    instance.$(".search-no-results").hide();
    instance.$(".test-case-list-selectable.highlight").removeClass("highlight");
    instance.$(".test-case-list-selectable").show();
  },
  "click .add-item-form a": function (e, instance) {
    var itemType = $(e.target).closest("a").attr("data-name"),
        itemName = instance.$(".add-item-form input").val().trim(),
        projectId = FlowRouter.getParam("projectId"),
        versionId = FlowRouter.getParam("projectVersionId"),
        groupId = instance.$(".test-case-list-group.selected").attr("data-group-id");

    if(itemType && itemName && itemName.length){
      if(itemType == "testcase"){
        TestCases.insert({
          projectId: projectId,
          projectVersionId: versionId,
          testGroupId: groupId,
          title: itemName
        }, function (error, result) {
          if(error){
            console.error("Failed to insert test case: " + error.message);
            RobaDialog.error("Failed to insert test case: " + error.message);
          } else {
            instance.$(".add-item-form input").val("")
          }
        });
      } else if(itemType == "testgroup") {
        TestGroups.insert({
          projectId: projectId,
          projectVersionId: versionId,
          parentGroupId: groupId,
          title: itemName
        }, function (error, result) {
          if(error){
            console.error("Failed to insert test group: " + error.message);
            RobaDialog.error("Failed to insert test group: " + error.message);
          } else {
            instance.$(".add-item-form input").val("")
          }
        });
      }
    }
  },
  "click .test-case-list-item": function (e, instance) {
    if(instance.data.editable){
      var selectable = $(e.target).closest(".test-case-list-item");
      instance.$(".test-case-list-item.selected").removeClass("selected");
      selectable.addClass("selected");
      FlowRouter.setQueryParams({testCaseId: selectable.attr("data-pk")});
    }
  },
  // make sure the draggable and droppable items stay up to date
  "mouseover .test-case-list-selectable:not(.ui-draggable)": function (e, instance) {
    $(e.target).closest(instance.draggableSelector).draggable(instance.draggableOptions);
  },
  "mouseover .test-case-list-group:not(.ui-droppable)": function (e, instance) {
    if(instance.data.editable){
      $(e.target).closest(".test-case-list-group").droppable(instance.droppableOptions);
    }
  }
});

/**
 * Template Created
 */
Template.TestCaseList.created = function () {
  var instance = this;
  instance.elementIdReactor = new ReactiveVar();

  instance.autorun(function () {
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");

    instance.subscribe("test_cases", projectId, projectVersionId);
    instance.subscribe("test_groups", projectId, projectVersionId);
  });
};

/**
 * Template Rendered
 */
Template.TestCaseList.rendered = function () {
  var instance = Template.instance();

  // setup the draggable config
  instance.draggableSelector = ".test-case-list-selectable";
  instance.draggableOptions = {
    revert: "invalid",
    distance: 5,
    start: function (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop: function (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  };
  if(instance.data.editable){
    instance.draggableOptions.axis = "y";
  }
  if(instance.data.connectToSortable){
    instance.draggableOptions.connectToSortable = instance.data.connectToSortable;
    instance.draggableOptions.helper = "clone";
    //instance.draggableSelector = ".test-case-list-item";
  }

  // make the list items draggable
  instance.$(instance.draggableSelector).draggable(instance.draggableOptions);

  if(instance.data.editable) {
    // setup the droppable config
    instance.droppableOptions = {
      greedy: true,
      hoverClass: "test-case-list-drop-hover",
      drop: function (event, ui) {
        var groupId = $(this).attr("data-group-id"),
          itemId = ui.draggable.attr("data-pk"),
          itemIsGroup = ui.draggable.hasClass("test-case-list-group");
        console.log("Drop: ", itemId, "on", groupId);
        if (groupId && itemId) {
          if (itemIsGroup) {
            TestGroups.update(itemId, {$set: {parentGroupId: groupId}}, function (error) {
              if (error) {
                console.error("Failed to update parent group: " + error.message);
                RobaDialog.error("Failed to update parent group: " + error.message);
              }
            });
          } else {
            TestCases.update(itemId, {$set: {testGroupId: groupId}}, function (error) {
              if (error) {
                console.error("Failed to update test group: " + error.message);
                RobaDialog.error("Failed to update test group: " + error.message);
              }
            });
          }
        }
      },
      accept: function (el) {
        var dragParentId = $(el).attr("data-parent-id"),
          dragId = $(el).attr("data-group-id"),
          targetId = $(this).attr("data-group-id"),
          isChild = false;
        if (dragId) {
          isChild = $(this).closest("[data-group-id='" + dragId + "']").length > 0;
        }
        return dragParentId !== targetId && !isChild;
      }
    };

    // make the groups droppable
    instance.$(".test-case-list-group").droppable(instance.droppableOptions);

    // Select the selected item if there is one defined
    var testCaseId = FlowRouter.getQueryParam("testCaseId");
    if(testCaseId){
      instance.autorun(function () {
        var testCaseItem = instance.$(".test-case-list-item[data-pk='" + testCaseId + "']"),
            elementId = instance.elementIdReactor.get();

        if(elementId){
          testCaseItem.addClass("selected");
          testCaseItem.parentsUntil(".test-case-list", ".test-case-list-group-items.hide").each(function (i, el) {
            Blaze.getView(el).templateInstance().expanded.set(true);
          });
        }
      });
    }
  }
};

/**
 * Template Destroyed
 */
Template.TestCaseList.destroyed = function () {
  
};

/**
 * Template Helpers
 */
Template.TestRunItemList.helpers({
  hasItems: function () {
    return Template.instance().collection.find({ parentId: this.staticId }).count();
  },
  testRunItems: function () {
    return Template.instance().collection.find({ parentId: this.staticId }, {sort: {order: 1}});
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunItemList.events({
  "click .test-run-item-delete": function (e, instance) {
    e.stopImmediatePropagation();
    var item = this;

    if(item){
      instance.deleteItem(item);
    }
  }
});

/**
 * Template Created
 */
Template.TestRunItemList.created = function () {
  var instance = this;

  // Setup the collection based on whether this is a template or not
  instance.collection = Collections.TestRunTemplateItems;
  if(instance.data && instance.data.isTemplate){

  }

  // Reorder items in this immediate list
  instance.reorderItems = function () {
    // don't pick up the sub-lists
    $(instance.firstNode).children(".test-run-item").each(function (i, el) {
      var newOrder = i + 1,
        oldOrder = parseFloat($(el).attr("data-order")),
        itemId = $(el).attr("data-pk");
      if(newOrder != oldOrder){
        instance.collection.update(itemId, {$set: {order: newOrder}}, function (error, response) {
          if(error){
            console.error("Test Run Item order update failed: " + error.message);
            Dialog.error("Test Run Item order update failed: " + error.message);
          }
        });
      }
    });
  };

  // Recursively delete items
  instance.deleteItem = function (item) {
    // delete the children first
    instance.collection.find({parentId: item.staticId}).forEach(function (child) {
      console.log("Removing test run item child: ", child._id, TestRunItemTypesLookup[child.type]);
      instance.deleteItem(child);
    });

    // then delete the record
    console.log("Removing test run item: ", item._id, TestRunItemTypesLookup[item.type]);
    instance.collection.remove(item._id, function (error) {
      if(error){
        console.error("Failed to delete test run item: " + error.message);
        Dialog.error("Failed to delete test run item: " + error.message);
      } else {
        instance.reorderItems();
      }
    });
  };

  // Accept a new item not from a test-run-item-list
  instance.acceptNewItem = function (event, ui) {
    var newItem,
      data = instance.data,
      templateId = ui.helper.closest(".test-run-template-container").attr("data-template-id"),
      parentId = ui.helper.closest(".test-run-item-list").attr("data-parent-id");

    // Add new items
    if(ui.sender.hasClass("test-case-list-item")){
      var testCaseId = ui.sender.attr("data-staticId");
      if(testCaseId){
        newItem = {
          projectId: data.projectId,
          projectVersionId: data.projectVersionId,
          templateId: templateId,
          parentId: parentId,
          type: TestRunItemTypes.test,
          config: {
            testCaseId: testCaseId
          }
        };
      }
    } else if(ui.sender.hasClass("test-case-list-group")){
      var testGroupId = ui.sender.attr("data-group-id");
      if(testGroupId){
        newItem = {
          projectId: data.projectId,
          projectVersionId: data.projectVersionId,
          templateId: templateId,
          parentId: parentId,
          type: TestRunItemTypes.testGroup,
          config: {
            testGroupId: testGroupId
          }
        };
      }
    } else if(ui.sender.hasClass("test-run-new-item")) {
      var itemType = ui.sender.attr("data-type");
      if(itemType) {
        newItem = {
          projectId: data.projectId,
          projectVersionId: data.projectVersionId,
          templateId: templateId,
          parentId: parentId,
          type: itemType,
          config: {}
        };
      }
    } else if(ui.sender.hasClass("test-run-template-list-item")) {
      var templateId = ui.sender.attr("data-template-id");
      if(templateId) {
        newItem = {
          projectId: data.projectId,
          projectVersionId: data.projectVersionId,
          templateId: templateId,
          parentId: parentId,
          type: TestRunItemTypes.template,
          config: {
            templateId: templateId
          }
        };
      }
    } else {
      console.log("Unknown Drop: ", ui);
    }

    if(newItem){
      // pick up the new order
      var lastOrder = ui.helper.prev().attr("data-order") || 0;
      newItem.order = parseInt(lastOrder) + 0.1;

      // create the record
      instance.collection.insert(newItem, function (error) {
        if(error){
          console.error("Test Run Item insert failed: " + error.message);
          Dialog.error("Test Run Item insert failed: " + error.message);
        } else {
          instance.reorderItems();
        }
      });
    }

    // Don't need the helper because the record will get rendered
    ui.helper.remove();
  }
};

/**
 * Template Rendered
 */
Template.TestRunItemList.rendered = function () {
  var instance = this;
  instance.$("> .test-run-item-list").sortable({
    forcePlaceholderSize: true,
    placeholder: "test-run-item-list-placeholder",
    items: ">div:not(.alert)",
    connectWith: ".test-run-item-list",
    update: function (event, ui) {
      instance.reorderItems();
    },
    receive: function (event, ui) {
      // items from foreign sources have helpers
      if(ui.helper){
        instance.acceptNewItem(event, ui);
      } else if(ui.item && ui.item.hasClass("test-run-item")){
        var itemId = ui.item.attr("data-pk"),
          parentId = ui.item.closest(".test-run-item-list").attr("data-parent-id"),
          newOrder = parseInt(ui.item.prev().attr("data-order") || 0) + 0.1;
        instance.collection.update(itemId, {$set: {parentId: parentId, order: newOrder}}, function (error) {
          if(error){
            console.error("Test Run Item update failed: " + error.message);
            Dialog.error("Test Run Item update failed: " + error.message);
          } else {
            instance.reorderItems();
          }
        });
        return;
      }
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestRunItemList.destroyed = function () {
  
};

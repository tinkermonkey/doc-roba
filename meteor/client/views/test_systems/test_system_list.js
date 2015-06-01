/**
 * Template Helpers
 */
Template.TestSystemList.helpers({
  sortedTestSystems: function () {
    return TestSystems.find({projectVersionId: this.version._id}, {sort: {order: 1}}).fetch();
  }
});

/**
 * Template Helpers
 */
Template.TestSystemList.events({
  "click .btn-add-test-system": function () {
    var instance = Template.instance(),
      order = instance.$(".sortable-table-row").length;
    TestSystems.insert({
      projectId: this.project._id,
      projectVersionId: this.version._id,
      title: "New Test System",
      type: TestAgentTypes.selenium,
      hostname: "test.test.com",
      port: "4444",
      active: true,
      order: order
    }, function (error, response) {
      if(error){
        Meteor.log.error("Insert failed: " + error.message);
        Dialog.error("Insert failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".sortable-table-row[data-pk='" + response + "'] .editable[data-key='title']").editable("show");
        }, 250);
      }
    });
  },
  "click .sortable-table-row .btn-delete": function () {
    var testSystem = this;

    Dialog.show({
      title: "Delete Test System Configuration?",
      text: "Are you sure that you want to delete the test system configuration <span class='label label-primary'>" + testSystem.title + "</span> from this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          TestSystems.remove(testSystem._id, function (error, response) {
            Dialog.hide();
            if(error){
              Meteor.log.error("Delete failed: " + error.message);
              Dialog.error("Delete failed: " + error.message);
            }
          });
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "edited .editable": function (e, instance, newValue) {
    var testSystemId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;
    TestSystems.update(testSystemId, update, function (error) {
      if(error){
        Meteor.log.error("Test System update failed: " + error.message);
        Dialog.error("Test System update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.TestSystemList.rendered = function () {
  var instance = Template.instance();

  instance.$(".sortable-table")
    .sortable({
      items: "> .sortable-table-row",
      handle: ".drag-handle",
      helper: function(e, ui) {
        // fix the width
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui;
      },
      axis: "y",
      forcePlaceholderSize: true,
      update: function (event, ui) {
        var order;
        instance.$(".sortable-table-row").each(function (i, el) {
          order = $(el).attr("data-sort-order");
          if(order != i){
            console.log("Updating order: ", i, $(el).attr("data-pk"));
            TestSystems.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
              if(error){
                Meteor.log.error("Test System order update failed: " + error.message);
                Dialog.error("Test System order update failed: " + error.message);
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
Template.TestSystemList.destroyed = function () {

};

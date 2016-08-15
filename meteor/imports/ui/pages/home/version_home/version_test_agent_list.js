/**
 * Template Helpers
 */
Template.VersionTestAgentList.helpers({
  sortedTestAgents: function () {
    return Collections.TestAgents.find({projectVersionId: this._id}, {sort: {order: 1}}).fetch();
  }
});

/**
 * Template Event Handlers
 */
Template.VersionTestAgentList.events({
  "click .btn-add-test-agent": function (e, instance) {
    var order = instance.$(".sortable-table-row").length,
        projectVersion = this;

    Collections.TestAgents.insert({
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion._id,
      type: TestAgentTypes.selenium,
      os: TestAgentOS.Windows,
      title: "Some Browser",
      order: order
    }, function (error, response) {
      if(error){
        console.error("Insert failed: ", error);
        Dialog.error("Insert failed: " + error.message);
      } else {
        setTimeout(function () {
          instance.$(".sortable-table-row[data-pk='" + response + "']").find(".editable[data-key='type']").editable("show");
        }, 250);
      }
    });
  },
  "click .sortable-table-row .btn-delete": function () {
    var testAgent = this;

    Dialog.show({
      title: "Delete Test Agent Config?",
      text: "Are you sure that you want to delete the test agent configuration for this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Collections.TestAgents.remove(testAgent._id, function (error, response) {
            Dialog.hide();
            if(error){
              console.error("Delete failed: ", error);
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
    e.stopImmediatePropagation();
    
    var testAgentId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;
    Collections.TestAgents.update(testAgentId, update, function (error) {
      if(error){
        console.error("Test Agent update failed: ", error);
        Dialog.error("Test Agent update failed: " + error.message);
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
            Collections.TestAgents.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
              if(error){
                console.error("Test Agent order update failed: ", error);
                Dialog.error("Test Agent order update failed: " + error.message);
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

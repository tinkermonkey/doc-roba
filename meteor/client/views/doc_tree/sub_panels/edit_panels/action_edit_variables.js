/**
 * Template Helpers
 */
Template.action_edit_variables.helpers({
  indexedVariables: function () {
    var action = this,
      indexedVariables = _.map(action.variables, function (v, i) {v.index = i; v.actionId = action._id; return v; });
    return _.sortBy(indexedVariables, function (v) { return v.order });
  }
});

/**
 * Template Helpers
 */
Template.action_edit_variables.events({
  "click .btn-add-var": function (event) {
    var instance = Template.instance(),
      action = this,
      order = action.variables ? action.variables.length - 1 : 0;

    if(action){
      Actions.update(action._id, {
        $push: {
          variables: {
            order: order,
            name: "newVariable",
            type: FieldTypes.string,
            varIsArray: false
          }
        }
      }, function (error, response) {
        if(error){
          Meteor.log.error("Variable insert failed: " + error.message);
          Dialog.error("Variable insert failed: " + error.message);
        } else {
          // trigger editing on variable
          setTimeout(function () {
            instance.$(".sortable-table-row[data-variable-order='" + order + "'] .editable[data-key='name']").editable("show");
          }, 100);
        }
      });
    }
  },
  "click .btn-delete": function (e, instance) {
    var variable = this;

    Dialog.show({
      title: "Delete Variable?",
      text: "Are you sure you want to delete the variable <span class='label label-primary'>" + variable.name + "</span> from this action?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Actions.update(variable.actionId, { $pull: { variables: {order: variable.order} } }, function (error, response) {
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
    var actionId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      variableIndex = $(e.target).closest(".sortable-table-row").attr("data-variable-index"),
      fieldName = $(e.target).attr("data-key"),
      dataKey = "variables." + variableIndex + "." + fieldName,
      update = {$set: {}};

    update["$set"][dataKey] = newValue;

    // a few situations to check for
    if(fieldName == "name"){
      // update the datakey with the title
      console.log("Getting safe variable name: ", newValue, Util.varName(newValue));
      update["$set"][dataKey] = Util.varName(newValue);
    } else if (fieldName == "type") {
      // null the custom type if the type is not custom
      if(newValue != FieldTypes.custom) {
        update["$unset"] = {};
        update["$unset"]["variables." + variableIndex + ".customFieldType"] = 1;
      }
    }

    Actions.update(actionId, update, function (error) {
      if(error){
        Meteor.log.error("Action update failed: " + error.message);
        Dialog.error("Action update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.action_edit_variables.rendered = function () {
  var instance = Template.instance();

  // Make the field list sortable
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
      update: function (event, ui) {
        var actionId = instance.$(".action-variable-row").attr("data-pk"),
          update = {$set: {}},
          updateKey;

        instance.$(".action-variable-row").each(function (i, el) {
          updateKey = "variables." + parseInt($(el).attr("data-variable-index")) + ".order";
          update["$set"][updateKey] = i;
        });

        //console.log("Update pre-send: ", update);
        Actions.update(actionId, update, function (error) {
          if(error){
            Meteor.log.error("Action variable order update failed: " + error.message);
            Dialog.error("Action variable order update failed: " + error.message);
          }
        });

        instance.$(".sortable-table").sortable("cancel");      }
    })
    .disableSelection();
};

/**
 * Template Destroyed
 */
Template.action_edit_variables.destroyed = function () {

};

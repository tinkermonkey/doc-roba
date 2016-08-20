/**
 * Template Helpers
 */
Template.TestCaseStepWait.helpers({
  getRole: function () {
    return TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
  },
  waitPartners: function () {
    if(this.data && this.data.waitId){
      var stepIdMap = [], // keep a handy lookup of the step Is so we know what to remove
        waitPartnerIds = _.without(TestCaseSteps.find({
          "data.waitId": this.data.waitId,
          projectVersionId: this.projectVersionId
        }).map(function (step) {
          stepIdMap[step.testCaseRoleId] = step._id;
          return step.testCaseRoleId
        }), this.testCaseRoleId);

      return TestCaseRoles.find({
        staticId: {$in: waitPartnerIds},
        projectVersionId: this.projectVersionId
      }).map(function (role) {
        role.stepId = stepIdMap[role.staticId];
        return role
      })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepWait.events({
});

/**
 * Template Created
 */
Template.TestCaseStepWait.created = function () {
  var instance = this;

  // we need a reactive variable to keep waitId accurate for drag and drop
  instance.waitId = new ReactiveVar();

  // check for errors and manage changes to the waitId
  instance.autorun(function () {
    var data = Template.currentData(),
      roles = TestCaseRoles.find({
        staticId: {$ne: data.testCaseRoleId },
        testCaseId: data.testCaseId,
        projectVersionId: data.projectVersionId
      }, {sort: {order: 1}}).fetch();

    if(data.data && data.data.waitId){
      instance.waitId.set(data.data.waitId);
    } else {
      instance.waitId.set();
    }

    data.error.set();

    if(roles.length > 0){

    } else {
      data.error.set("You need more than one role in order for a wait step to make sense");
    }
  });

  // setup the functionality of updating the removables list
  instance.updateRemovables = function (propagate){
    var refreshFailed = false,
      waitId = instance.waitId.get();
    try {
      instance.$(".removable-wait").draggable("refresh");
    } catch(error) {
      refreshFailed = true;
    }
    if(refreshFailed){
      instance.$(".removable-wait").draggable({
        revert: true,
        revertDuration: 100,
        start: function (event, ui) {
          ui.helper.addClass("draggable-wait-dragged");
          ui.helper.data("dropped", false);
        },
        stop: function (event, ui) {
          var keep = ui.helper.data("dropped"),
            removeId = ui.helper.attr("data-remove-id");

          if(!keep && removeId){
            console.log("Update Step remove waitId", removeId);
            TestCaseSteps.update(removeId, {$unset: {"data.waitId": true }}, function (error) {
              if(error){
                console.error("Failed to update step: " + error.message);
                RobaDialog.error("Failed to update step: " + error.message);
              }
            });
          }
        }
      });
    }

    // propagate to the other member of this waitId
    if(propagate && waitId){
      $(".droppable-wait[data-wait-id='" + waitId + "']:not([data-step-id='" + instance.data._id + "'])").each(function (i, el) {
        try {
          Blaze.getView(el).templateInstance().updateRemovables(false);
        } catch (error) {
          console.error("Failed to propagate updateRemovables: " + error.message);
        }
      });
    }
  };
};

/**
 * Template Rendered
 */
Template.TestCaseStepWait.rendered = function () {
  var instance = this;

  // Setup the join draggable behavior
  instance.$(".draggable-wait").draggable({
    helper: "clone",
    start: function (event, ui) {
      ui.helper.addClass("draggable-wait-dragged");
    }
  });

  // Setup the remove draggable behavior
  instance.updateRemovables();

  // Setup the droppable behavior
  instance.$(".droppable-wait").droppable({
    accept: function (el){
      var data = instance.data,
        currentWaitId = instance.waitId.get(),
        drag = $(el);

      // check for removables
      if(drag.hasClass("removable-wait")){
        return drag.attr("data-step-id") == data._id
      }

      if(!drag.hasClass("draggable-wait")){
        return false;
      }

      if(currentWaitId){
        return !(drag.attr("data-role-id") == data.testCaseRoleId || drag.attr("data-wait-id") == currentWaitId)
      } else {
        return !(drag.attr("data-role-id") == data.testCaseRoleId)
      }
    },
    activeClass: "droppable-wait-active",
    hoverClass: "droppable-wait-hover",
    drop: function (event, ui) {
      var drop = $(this),
        drag = ui.draggable;

      // check for a self-drop or remove
      if(drag.hasClass("removable-wait")){
        ui.draggable.data("dropped", true);
        return;
      }

      // see if either of these elements has a wait id
      var dragWaitId  = drag.attr("data-wait-id"),
        dropWaitId    = drop.attr("data-wait-id"),
        dragStepId    = drag.attr("data-step-id"),
        dropStepId    = drop.attr("data-step-id"),
        dropStaticId  = drop.attr("data-static-id"),
        updates = [];

      // make sure we don't have a collision here
      if(dragWaitId && dropWaitId){
        // not so sure what to do
      } else if(dragWaitId || dropWaitId){
        // there is a waitId, propagate it
        if(dragWaitId){
          // update the drop target to use this waitId
          updates.push({
            stepId: dropStepId,
            waitId: dragWaitId
          });
        } else {
          // update the drag element to use this waitId
          updates.push({
            stepId: dragStepId,
            waitId: dropWaitId
          });
        }
      } else {
        // no one has a waitId yet, pick one and move on
        updates.push({
          stepId: dragStepId,
          waitId: dropStaticId
        },{
          stepId: dropStepId,
          waitId: dropStaticId
        });
      }

      // do the actual updating
      _.each(updates, function (update) {
        if(update.waitId){
          var stepData = TestCaseSteps.findOne(update.stepId).data || {};
          stepData.waitId = update.waitId;
          console.log("Update Step waitId", update.stepId, {$set: {data: stepData }});
          TestCaseSteps.update(update.stepId, {$set: {data: stepData }}, function (error) {
            if(error){
              console.error("Failed to update step: " + error.message);
              RobaDialog.error("Failed to update step: " + error.message);
            }
          });
        } else {
          console.error("Failed to update step: no waitId defined");
        }
      });

      // update the removable draggables
      setTimeout(function () {
        instance.updateRemovables(true);
      }, 100);
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseStepWait.destroyed = function () {
  
};

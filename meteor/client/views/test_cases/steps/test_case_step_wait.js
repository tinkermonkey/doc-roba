/**
 * Template Helpers
 */
Template.TestCaseStepWait.helpers({
  getRoles: function () {
    var waitRoles = [],
      stepData = this.data;
    TestCaseRoles.find({
      staticId: {$ne: this.testCaseRoleId },
      testCaseId: this.testCaseId,
      projectVersionId: this.projectVersionId
    }, {sort: {order: 1}}).forEach(function (role) {
      // check for a wait step
      if(TestCaseSteps.find({
          testCaseRoleId: role.staticId,
          type: TestCaseStepTypes.wait
        }).count()){
        waitRoles.push(role);
      }
    });
    return waitRoles;
  },
  checked: function (role, step) {
    if(step.data){
      return step.data[role.staticId];
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepWait.events({
  "click .wait-role": function (e, instance) {
    var testCaseStep = instance.data,
      currentData = instance.data.data || {},
      pairedRole = $(e.target).closest(".wait-role").attr("data-role-id"),
      check;

    if(pairedRole){
      check = currentData[pairedRole] ? false : true;

      // If our goal is to check the checkbox
      if(check){
        // make sure there is a paired step
        var query = {
          testCaseId: testCaseStep.testCaseId,
          projectVersionId: testCaseStep.projectVersionId,
          testCaseRoleId: pairedRole,
          type: TestCaseStepTypes.wait
        };
        query["data." + pairedRole] = {$exists: false};
        var pairedStep = TestCaseSteps.findOne(query, {sort: {order: 1}});

        // update the paired step
        var updatedList = [];
        if(pairedStep) {
          var pairedData = pairedStep.data || {},
            // get the list of already paired roles on the paired step and this step
            alsoRoleList = _.without(_.keys(pairedData), testCaseStep.testCaseRoleId),
            updateList = _.map(alsoRoleList, function (role) {return pairedData[role]})
              .concat(_.values(currentData));

          // update the update list
          updateList.push(pairedStep.staticId);
          _.each(updateList, function (stepId) {
            var step = TestCaseSteps.findOne({ staticId: stepId, projectVersionId: testCaseStep.projectVersionId }),
              update = {$set: {}};
            update.$set["data." + testCaseStep.testCaseRoleId] = testCaseStep.staticId;

            TestCaseSteps.update(step._id, update, function (error) {
              if(error){
                Meteor.log.error("Failed to update step: " + error.message);
                Dialog.error("Failed to update step: " + error.message);
              }
            });

            // note that this node was paired
            updatedList.push({
              role: step.testCaseRoleId,
              step: step.staticId
            })
          });

          // update this step
          _.each(updatedList, function (update) {
            currentData[update.role] = update.step;
          });
          console.log("TestCaseStep data update: ", testCaseStep, currentData);
          TestCaseSteps.update(testCaseStep._id, {$set: {data: currentData}}, function (error) {
            if(error){
              Meteor.log.error("Failed to update step: " + error.message);
              Dialog.error("Failed to update step: " + error.message);
            }
          });
        } else {
          testCaseStep.error.set("Couldn't pair step for the other role");
        }
      } else {
        // grab the paired step if it still exists
        var pairedStep = TestCaseSteps.findOne({
          staticId: currentData[pairedRole],
          projectVersionId: testCaseStep.projectVersionId
        });
        if(pairedStep && pairedStep.data && pairedStep.data[testCaseStep.testCaseRoleId]){
          delete pairedStep.data[testCaseStep.testCaseRoleId];
          console.log("TestCaseStep paired data update: ", pairedStep);
          TestCaseSteps.update(pairedStep._id, {$set: {data: pairedStep.data}}, function (error) {
            if(error){
              Meteor.log.error("Failed to update step: " + error.message);
              Dialog.error("Failed to update step: " + error.message);
            }
          });
        }

        delete currentData[pairedRole];
        console.log("TestCaseStep data update: ", testCaseStep, currentData);
        TestCaseSteps.update(testCaseStep._id, {$set: {data: currentData}}, function (error) {
          if(error){
            Meteor.log.error("Failed to update step: " + error.message);
            Dialog.error("Failed to update step: " + error.message);
          }
        });
      }
    }
  }
});

/**
 * Template Created
 */
Template.TestCaseStepWait.created = function () {
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData(),
      roles =  TestCaseRoles.find({
        staticId: {$ne: data.testCaseRoleId },
        testCaseId: data.testCaseId,
        projectVersionId: data.projectVersionId
      }, {sort: {order: 1}}).fetch();

    data.error.set();

    if(roles.length > 0){

    } else {
      data.error.set("You need more than one role in order for a wait step to make sense");
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseStepWait.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepWait.destroyed = function () {
  
};

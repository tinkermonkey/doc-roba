/**
 * Misc general server methods
 */
Meteor.startup(function () {
  Meteor.methods({
    // Update a documentation method from webdriver.io
    updateDriverCommand: function (docs) {
      if (docs) {
        _.each(docs, function (doc) {
          // check to see if the doc exists
          var exists = DriverCommands.find({name: doc.name}).count();
          if (exists) {
            DriverCommands.update({name: doc.name}, {$set: doc});
          } else {
            DriverCommands.insert(doc);
          }
        });
      }
    },
    /**
     * Give a user a role for a project
     * @param projectId
     * @param userId
     */
    grantProjectRole: function (projectId, userId, role) {
      console.info("grantProjectRole: " + projectId + ", " + userId + ", " + role);
      var user = Meteor.users.findOne(userId);
      if(user && RoleTypesLookup[role]){
        user.addProjectRole(projectId, role);
      }
    }
  });
});

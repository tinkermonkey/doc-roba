/**
 * ============================================================================
 * Global allow/deny helpers
 * ============================================================================
 */
Auth = {
  /**
   * Global helper for methods to require authentication
   * @param userId
   */
  requireAuthentication: function () {
    var userId = Meteor.userId();
    if(!userId){
      throw new Meteor.Error(403);
    }
    var user = Meteor.users.findOne(userId);
    if(user){
      return user
    }
    throw new Meteor.Error(403);
  },

  /**
   * Global helper for subscriptions
   * @param userId
   * @param projectId
   */
  hasProjectAccess: function (userId, projectId) {
    //console.debug("hasProjectAccess: " + userId + ", " + projectId);
    if(userId && projectId){
      var user = Meteor.users.findOne(userId);
      //console.debug("hasProjectAccess: " + (user && user.hasProjectAccess(projectId)));
      return user && user.hasProjectAccess(projectId)
    }
  },

  /**
   * Allow authenticated use
   * @param userId
   * @param doc
   * @returns {boolean}
   */
  allowIfAuthenticated: function (userId, doc) {
    return userId !== null;
  },

  /**
   * Operation not permitted client-side
   */
  denyAlways: function () {
    return true;
  },

  /**
   * Deny if the user does not have access to the project
   * @param userId
   * @param doc
   * @returns {boolean}
   */
  denyIfNoProjectAccess: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc.projectId){
      return !user.hasProjectAccess(doc.projectId);
    }
    return true;
  },

  /**
   * Deny any user without admin privileges
   * @param userId
   * @param doc
   * @returns {*|boolean}
   */
  denyIfNotAdmin: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc.projectId){
      return !user.hasAdminAccess(doc.projectId);
    }
    return true;
  },

  /**
   * Deny any user without test privileges
   * @param userId
   * @param doc
   * @returns {*|boolean}
   */
  denyIfNotTester: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc.projectId){
      return !user.hasTesterAccess(doc.projectId);
    }
    return true;
  },

  /**
   * Deny if the user does not have access to create a project
   * @param userId
   * @param doc
   * @returns {boolean}
   */
  denyIfNoProjectCreation: function (userId) {
    var user = Meteor.users.findOne(userId);
    if(userId && user){
      return !(user.isSystemAdmin || Meteor.settings.allowPersonalProjects)
    }
    return true;
  }
};

/**
 * Standard rule sets for use in allow/deny rules
 */
Auth.ruleSets = {
  allow: {
    // Standard allow rule just checks authentication
    // The deny rule will do the heavy lifting
    ifAuthenticated: {
      insert: Auth.allowIfAuthenticated,
      update: Auth.allowIfAuthenticated,
      remove: Auth.allowIfAuthenticated,
      fetch: []
    }
  },
  deny: {
    // No client-side changes
    always: {
      insert: Auth.denyAlways,
      update: Auth.denyAlways,
      remove: Auth.denyAlways,
      fetch: []
    },
    // Require only basic authentication
    ifNoProjectAccess: {
      insert: Auth.denyIfNoProjectAccess,
      update: Auth.denyIfNoProjectAccess,
      remove: Auth.denyIfNoProjectAccess,
      fetch: ['projectId']
    },
    // Require tester privileges
    ifNotTester: {
      insert: Auth.denyIfNotTester,
      update: Auth.denyIfNotTester,
      remove: Auth.denyIfNotTester,
      fetch: ['projectId']
    },
    // Require project admin privileges
    ifNotAdmin: {
      insert: Auth.denyIfNotAdmin,
      update: Auth.denyIfNotAdmin,
      remove: Auth.denyIfNotAdmin,
      fetch: ['projectId']
    }
  }
};

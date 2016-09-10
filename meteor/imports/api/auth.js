/**
 * Global permissions helpers
 */
export const Auth = {
  /**
   * Global helper for methods to require authentication
   * @returns {user}
   */
  requireAuthentication() {
    var user = Meteor.users.findOne(Meteor.userId());
    if(user){
      return user
    }
    throw new Meteor.Error("403");
  },
  
  /**
   * Global helper for methods to require authentication
   * @returns {user}
   */
  requireProjectAccess(projectId) {
    let user = Meteor.users.findOne(Meteor.userId());
    if(user && user.hasProjectAccess(projectId)){
      return user;
    }
    throw new Meteor.Error("403");
  },

  /**
   * Project permissions checker
   * @param userId
   * @param projectId
   * @returns {boolean}
   */
  hasProjectAccess(userId, projectId) {
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
   * @returns {boolean}
   */
  allowIfAuthenticated(userId) {
    return userId !== null;
  },

  /**
   * Operation not permitted client-side
   */
  denyAlways() {
    return true;
  },

  /**
   * Deny if the user does not have access to the project
   * @param userId
   * @param doc
   * @returns {boolean}
   */
  denyIfNoProjectAccess(userId, doc) {
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
  denyIfNotAdmin(userId, doc) {
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
  denyIfNotTester(userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc.projectId){
      return !user.hasTesterAccess(doc.projectId);
    }
    return true;
  },

  /**
   * Deny if the user does not have access to create a project
   * @param userId
   * @returns {boolean}
   */
  denyIfNoProjectCreation(userId) {
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

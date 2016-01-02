
/**
 * Setup the default router config
 */
Router.configure({
  layoutTemplate: "BaseLayout",
  loadingTemplate: "loading"
});

/**
 * Defined routes
 */
Router.map(function () {
  this.route("not_found", {
    path: "/not_found"
  });
  this.route("root", {
    path: "/",
    template: "Home"
  });
  this.route("Login", {
    path: "/login"
  });
  this.route("Logout", {
    path: "/logout"
  });
  this.route("Home", {
    path: "/home/"
  });
  this.route("ProjectHome", {
    path: "/home/:_id"
  });
  this.route("VersionHome", {
    path: "/home/:projectId/:_id"
  });
  this.route("DocTree", {
    path: "/doc_tree/:projectId/:_id"
  });
  this.route("TestCaseDashboard", {
    path: "/test_case_dashboard/:projectId/:_id"
  });
  this.route("TestRunTemplateDashboard", {
    path: "/test_run_template_dashboard/:projectId/:_id"
  });
  this.route("DriverCommandList", {
    path: "/driver_command_list"
  });
  this.route("adventure_console", {
    path: "/adventure_console/:projectId/:projectVersionId/:adventureId",
    layoutTemplate: "NoMenuLayout",
    data: function () {
      return {
        adventure: Collections.Adventures.findOne(this.params.adventureId),
        state: Collections.AdventureStates.findOne({adventureId: this.params.adventureId})
      };
    },
    waitOn: function () { return [
      Meteor.subscribe("projects"),
      Meteor.subscribe("project_versions"),
      Meteor.subscribe("adventure", this.params.adventureId),
      Meteor.subscribe("adventure_state", this.params.adventureId),
      Meteor.subscribe("adventure_actions", this.params.adventureId),
      Meteor.subscribe("adventure_commands", this.params.adventureId),
      Meteor.subscribe("nodes", this.params.projectId, this.params.projectVersionId),
      Meteor.subscribe("actions", this.params.projectId, this.params.projectVersionId),
      Meteor.subscribe("servers", this.params.projectId, this.params.projectVersionId),
      Meteor.subscribe("test_systems", this.params.projectId, this.params.projectVersionId),
      Meteor.subscribe("test_agents", this.params.projectId, this.params.projectVersionId)
    ]; }
  });
  this.route("adventure_log", {
    path: "/adventure_log/:adventureId",
    data: function () { return Collections.Adventures.findOne(this.params.adventureId); },
    waitOn: function () { return [
      Meteor.subscribe("adventure", this.params.adventureId)
    ]; }
  });
  this.route("test_result", {
    path: "/test_result/:projectId/:_id",
    layoutTemplate: "CenterPoleLayout",
    data: function () { return Collections.TestResults.findOne(this.params._id); },
    waitOn: function () { return [
      Meteor.subscribe("projects"),
      Meteor.subscribe("project_versions"),
      Meteor.subscribe("test_result", this.params.projectId, this.params._id),
      Meteor.subscribe("test_result_roles", this.params.projectId, this.params._id),
      Meteor.subscribe("test_result_steps", this.params.projectId, this.params._id),
      Meteor.subscribe("test_result_screenshots", this.params.projectId, this.params._id),
      Meteor.subscribe("test_result_log", this.params.projectId, this.params._id)
    ]; }
  });
  this.route("test", {
    path: "/test/",
    //layoutTemplate: "test_layout",
    waitOn: function () { return [
      Meteor.subscribe("screenshots")
    ]; }
  });
});

/**
 * Handy helper function for updating the current query params
 */
Router.query = function (queryUpdate) {
  var currentRoute = this.current();
  this.go(currentRoute.route.getName(), currentRoute.params, {
    query: _.extend(currentRoute.params.query, queryUpdate)
  });
};
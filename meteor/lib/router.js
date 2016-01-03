
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
    path: "/home/:projectId"
  });
  this.route("VersionHome", {
    path: "/home/:projectId/:projectVersionId"
  });
  this.route("DocTree", {
    path: "/doc_tree/:projectId/:projectVersionId"
  });
  this.route("TestCaseDashboard", {
    path: "/test_case_dashboard/:projectId/:projectVersionId"
  });
  this.route("TestRunTemplateDashboard", {
    path: "/test_run_template_dashboard/:projectId/:projectVersionId"
  });
  this.route("AdventureConsole", {
    path: "/adventure_console/:projectId/:projectVersionId/:adventureId"
  });
  this.route("AdventureLog", {
    path: "/adventure_log/:projectId/:projectVersionId/:adventureId"
  });
  this.route("test_result", {
    path: "/test_result/:projectId/:projectVersionId/:testResultId"
  });
  this.route("DriverCommandList", {
    path: "/driver_command_list"
  });
  this.route("test", {
    path: "/test/"
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
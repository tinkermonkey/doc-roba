
/**
 * Setup the default router config
 */
Router.configure({
  layoutTemplate: "layout",
  loadingTemplate: "loading",
  notFoundTemplate: "not_found",
  waitOn: function () { return [
    Meteor.subscribe("projects"),
    Meteor.subscribe("project_roles"),
    Meteor.subscribe("project_versions"),
    Meteor.subscribe("changes")
  ]; }
});
Router.plugin("dataNotFound", {notFoundTemplate: "not_found"});
Router.onBeforeAction("loading");
Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    console.log("Intercepted unauthenticated users, routing to login");
    this.render("Login", {data: {intercepted: true}});
  } else {
    this.next();
  }
}, { except: ["login", "root", "logout", "test"] });

/**
 * Defined routes
 */
Router.map(function () {
  this.route("not_found", {
    path: "/not_found"
  });
  this.route("root", {
    path: "/",
    action: function () {
      if (Meteor.userId()) {
        this.redirect("/home");
      } else {
        this.redirect("/login");
      }
    }
  });
  this.route("login", {
    layoutTemplate: "insecure_layout",
    path: "/login"
  });
  this.route("logout", {
    layoutTemplate: "insecure_layout",
    path: "/logout",
    onBeforeAction: function () {
      Meteor.logout();
      this.next();
    }
  });
  this.route("home", {
    path: "/home/",
    waitOn: function () { return [
    ]; }
  });
  this.route("home_project", {
    path: "/home/projects/:_id",
    template: "Home",
    data: function () {
      return { project: Projects.findOne({_id: this.params._id}) };
    },
    waitOn: function () { return [
    ]; }
  });
  this.route("home_version", {
    path: "/home/projects/:projectId/versions/:_id",
    template: "Home",
    data: function () {
      return {
        project: Projects.findOne({_id: this.params.projectId}),
        version: ProjectVersions.findOne({_id: this.params._id})
      };
    },
    waitOn: function () { return [
      Meteor.subscribe("user_types", this.params.projectId, this.params._id),
      Meteor.subscribe("data_stores", this.params.projectId, this.params._id),
      Meteor.subscribe("all_data_store_fields", this.params.projectId, this.params._id),
      Meteor.subscribe("all_data_store_rows", this.params.projectId, this.params._id),
      Meteor.subscribe("servers", this.params.projectId, this.params._id),
      Meteor.subscribe("test_systems", this.params.projectId, this.params._id),
      Meteor.subscribe("test_agents", this.params.projectId, this.params._id)
    ]; }
  });
  this.route("doc_tree", {
    path: "/doc_tree/projects/:projectId/versions/:_id",
    data: function () {
      var project = Projects.findOne({_id: this.params.projectId}),
        version = ProjectVersions.findOne({_id: this.params._id});

      if(project && version){
        return {
          project: project,
          version: version
        };
      }
    },
    waitOn: function () { return [
      Meteor.subscribe("projects"),
      Meteor.subscribe("project_roles"),
      Meteor.subscribe("project_versions"),
      Meteor.subscribe("nodes", this.params.projectId, this.params._id),
      Meteor.subscribe("actions", this.params.projectId, this.params._id),
      Meteor.subscribe("data_stores", this.params.projectId, this.params._id),
      Meteor.subscribe("all_data_store_fields", this.params.projectId, this.params._id),
      Meteor.subscribe("all_data_store_rows", this.params.projectId, this.params._id),
      Meteor.subscribe("servers", this.params.projectId, this.params._id),
      Meteor.subscribe("test_systems", this.params.projectId, this.params._id),
      Meteor.subscribe("test_agents", this.params.projectId, this.params._id)
    ]; }
  });
  this.route("test_case_dashboard", {
    path: "/test_case_dashboard/:projectId/:_id",
    data: function () {
      return {
        project: Projects.findOne({_id: this.params.projectId}),
        version: ProjectVersions.findOne({_id: this.params._id})
      };
    },
    waitOn: function () { return [
      Meteor.subscribe("test_groups", this.params.projectId, this.params._id),
      Meteor.subscribe("test_cases", this.params.projectId, this.params._id),
      Meteor.subscribe("nodes", this.params.projectId, this.params._id),
      Meteor.subscribe("actions", this.params.projectId, this.params._id)
    ]; }
  });
  this.route("driver_command_list", {
    path: "/driver_command_list",
    data: function () { return DriverCommands.find({}, {sort: {type: 1, name: 1}}); },
    waitOn: function () { return [Meteor.subscribe("driver_commands")]; }
  });
  this.route("adventure_console", {
    path: "/adventure_console/:projectId/:projectVersionId/:adventureId",
    layoutTemplate: "no_menu_layout",
    data: function () {
      return {
        adventure: Adventures.findOne(this.params.adventureId),
        state: AdventureStates.findOne({adventureId: this.params.adventureId})
      };
    },
    waitOn: function () { return [
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
    data: function () { return Adventures.findOne(this.params.adventureId); },
    waitOn: function () { return [
      Meteor.subscribe("adventure", this.params.adventureId),
      Meteor.subscribe("adventure_log", this.params.adventureId)
    ]; }
  });
  this.route("test_result", {
    path: "/test_result/:projectId/:_id",
    data: function () { return TestResults.findOne(this.params._id); },
    waitOn: function () { return [
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

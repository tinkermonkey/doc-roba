BlazeLayout.setRoot('body');
FlowRouter.notFound = {
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "NotFound"
    });
  }
};
FlowRouter.route("/", {
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header: "CurrentProjectHeader",
      nav: "HomeNav"
    });
  }
});
FlowRouter.route("/login", {
  name: "Login",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Login"
    });
  }
});
FlowRouter.route("/logout", {
  name: "Logout",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Logout"
    });
  }
});
FlowRouter.route("/home/", {
  name: "Home",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header: "CurrentProjectHeader",
      nav: "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId", {
  name: "ProjectHome",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "ProjectHome",
      header: "CurrentProjectHeader",
      nav: "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId/:projectVersionId", {
  name: "VersionHome",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "VersionHome",
      header: "CurrentProjectHeader",
      nav: "HomeNav"
    });
  }
});
FlowRouter.route("/doc_tree/:projectId/:projectVersionId", {
  name: "DocTree",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "DocTree",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/test_case_dashboard/:projectId/:projectVersionId", {
  name: "TestCaseDashboard",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestCaseDashboard",
      svgDefs: "MinimalSvgDefs",
      header: "CurrentProjectHeader",
      nav: "TestCaseNav"
    });
  }
});
FlowRouter.route("/test_run_template_dashboard/:projectId/:projectVersionId", {
  name: "TestRunTemplateDashboard",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestRunTemplateDashboard",
      svgDefs: "MinimalSvgDefs",
      header: "CurrentProjectHeader",
      nav: "TestRunTemplateNav"
    });
  }
});
FlowRouter.route("/adventure_console/:projectId/:projectVersionId/:adventureId", {
  name: "AdventureConsole",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureConsole",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/adventure_log/:projectId/:projectVersionId/:adventureId", {
  name: "AdventureLog",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureLog"
    });
  }
});
FlowRouter.route("/test_result/:projectId/:projectVersionId/:testResultId", {
  name: "TestResult",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestResult",
      svgDefs: "MinimalSvgDefs",
      header: "CurrentProjectHeader",
      nav: "TestResultNav"
    });
  }
});
FlowRouter.route("/driver_command_list", {
  name: "DriverCommandList",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "DriverCommandList",
      header: "ReferenceHeader",
      nav: "ReferenceNav"
    });
  }
});
FlowRouter.route("/test/", {
  name: "test",
  action: function(params) {
    BlazeLayout.render("BaseLayout", {
      content: "test"
    });
  }
});

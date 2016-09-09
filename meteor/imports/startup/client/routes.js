import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";

/**
 * Layouts
 */
import "../../ui/layouts/base_layout.js";
import "../../ui/layouts/center_pole_layout.js";
import "../../ui/layouts/fullscreen_layout.js";
import "../../ui/layouts/insecure_layout.js";
import "../../ui/layouts/no_menu_layout.js";

/**
 * Pages
 */
import "../../ui/insecure/login/login.js";
import "../../ui/insecure/logout/logout.js";
import "../../ui/insecure/not_found/not_found.js";
import "../../ui/pages/adventure_console/adventure_console.js";
import "../../ui/pages/adventure_console/adventure_log.js";
import "../../ui/pages/code_module/code_module_dashboard.js";
import "../../ui/pages/doc_tree/doc_tree.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/home/project_home/project_home.js";
import "../../ui/pages/home/version_home/version_home.js";
import "../../ui/pages/test_case/test_case_dashboard.js";

/**
 * Config
 */
BlazeLayout.setRoot('body');

/**
 * Routes
 */
FlowRouter.notFound = {
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "NotFound"
    });
  }
};
FlowRouter.route("/", {
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header : "CurrentUserHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/login", {
  name  : "Login",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "Login"
    });
  }
});
FlowRouter.route("/logout", {
  name  : "Logout",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "Logout"
    });
  }
});
FlowRouter.route("/home/", {
  name  : "Home",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header : "CurrentUserHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId", {
  name  : "ProjectHome",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "ProjectHome",
      header : "CurrentProjectHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId/:projectVersionId", {
  name  : "VersionHome",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "VersionHome",
      header : "CurrentProjectHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/doc_tree/:projectId/:projectVersionId", {
  name  : "DocTree",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "DocTree",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/test_case_dashboard/:projectId/:projectVersionId", {
  name  : "TestCaseDashboard",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestCaseDashboard",
      svgDefs: "MinimalSvgDefs",
      header : "CurrentProjectHeader",
      nav    : "TestCaseNav"
    });
  }
});
FlowRouter.route("/test_plan_dashboard/:projectId/:projectVersionId", {
  name  : "TestPlanDashboard",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestPlanDashboard",
      svgDefs: "MinimalSvgDefs",
      header : "CurrentProjectHeader",
      nav    : "TestPlanNav"
    });
  }
});
FlowRouter.route("/code_module_dashboard/:projectId/:projectVersionId", {
  name  : "CodeModuleDashboard",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "CodeModuleDashboard",
      svgDefs: "MinimalSvgDefs",
      header : "CurrentProjectHeader",
      nav    : "CodeModuleNav"
    });
  }
});
FlowRouter.route("/test_result/:projectId/:projectVersionId/:testResultId", {
  name  : "TestResult",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "TestResult",
      svgDefs: "MinimalSvgDefs",
      header : "CurrentProjectHeader",
      nav    : "TestResultNav"
    });
  }
});
FlowRouter.route("/adventure_console/:projectId/:projectVersionId/:adventureId", {
  name  : "AdventureConsole",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureConsole",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/adventure_log/:projectId/:projectVersionId/:adventureId", {
  name  : "AdventureLog",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureLog"
    });
  }
});
FlowRouter.route("/driver_command_list", {
  name  : "DriverCommandList",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "DriverCommandList",
      header : "ReferenceHeader",
      nav    : "ReferenceNav"
    });
  }
});
FlowRouter.route("/test/", {
  name  : "test",
  action: function (params) {
    BlazeLayout.render("BaseLayout", {
      content: "test"
    });
  }
});

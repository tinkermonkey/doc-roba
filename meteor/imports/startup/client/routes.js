import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";

/**
 * Layouts
 */
import "../../../client/ui/layouts/base_layout.js";
import "../../../client/ui/layouts/center_pole_layout.js";
import "../../../client/ui/layouts/fullscreen_layout.js";
import "../../../client/ui/layouts/insecure_layout.js";
import "../../../client/ui/layouts/no_menu_layout.js";

/**
 * Pages
 */
import "../../../client/ui/insecure/login/login.js";
import "../../../client/ui/insecure/logout/logout.js";
import "../../../client/ui/insecure/not_found/not_found.js";
import "../../../client/ui/pages/adventure_console/adventure_console.js";
import "../../../client/ui/pages/adventure_console/adventure_log.js";
import "../../../client/ui/pages/code_module/code_module_dashboard.js";
import "../../../client/ui/pages/doc_tree/doc_tree.js";
import "../../../client/ui/pages/home/home.js";
import "../../../client/ui/pages/home/project_home/project_home.js";
import "../../../client/ui/pages/home/version_home/version_home.js";
import "../../../client/ui/pages/test_case/test_case_dashboard.js";
import "../../../client/ui/pages/test_plan/test_plan_dashboard.js";
import "../../../client/ui/pages/test_result/test_result.js";

/**
 * Config
 */
BlazeLayout.setRoot('body');

/**
 * Routes
 */
FlowRouter.notFound = {
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "NotFound"
    });
  }
};
FlowRouter.route("/", {
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header : "CurrentUserHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/login", {
  name  : "Login",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Login"
    });
  }
});
FlowRouter.route("/logout", {
  name  : "Logout",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Logout"
    });
  }
});
FlowRouter.route("/home/", {
  name  : "Home",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "Home",
      header : "CurrentUserHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId", {
  name  : "ProjectHome",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "ProjectHome",
      header : "CurrentProjectHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/home/:projectId/:projectVersionId", {
  name  : "VersionHome",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "VersionHome",
      header : "CurrentProjectHeader",
      nav    : "HomeNav"
    });
  }
});
FlowRouter.route("/doc_tree/:projectId/:projectVersionId", {
  name  : "DocTree",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "DocTree",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/test_case_dashboard/:projectId/:projectVersionId", {
  name  : "TestCaseDashboard",
  action(params) {
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
  action(params) {
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
  action(params) {
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
  action(params) {
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
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureConsole",
      svgDefs: "StandardSvgDefs"
    });
  }
});
FlowRouter.route("/adventure_log/:projectId/:projectVersionId/:adventureId", {
  name  : "AdventureLog",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "AdventureLog"
    });
  }
});
FlowRouter.route("/driver_command_list", {
  name  : "DriverCommandList",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "DriverCommandList",
      header : "ReferenceHeader",
      nav    : "ReferenceNav"
    });
  }
});
FlowRouter.route("/test/", {
  name  : "test",
  action(params) {
    BlazeLayout.render("BaseLayout", {
      content: "test"
    });
  }
});

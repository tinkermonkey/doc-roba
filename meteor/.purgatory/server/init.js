console.log("DocRoba init");

/**
 * npm packages
 */
fs            = Npm.require("fs");
path          = Npm.require("path");
childProcess  = Npm.require("child_process");
AdmZip        = Npm.require("adm-zip");

// logging shim
console.debug = console.log;

/**
 * Top level configuration data
 */
DocRoba = {
  rootPath: fs.realpathSync(process.env.PWD)
};
console.log("DocRoba.rootPath:", DocRoba.rootPath);

/**
 * Initialize lookback emails
 */
Mailer.init({
  templates: EmailTemplates,
  helpers: EmailHelpers,
  replyTo: Meteor.settings.email.replyTo,
  from: Meteor.settings.email.from,
  layout: {
    name: "EmailLayout",
    path: "email_layout.html",
     css: "email_layout.css"
  }
});


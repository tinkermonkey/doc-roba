/**
 * Handle the launching of various child processes
 */
Meteor.startup(function () {
  // Needed to launch helpers
  fs             = Npm.require("fs");
  exec           = Npm.require("child_process").exec;
  spawn          = Npm.require("child_process").spawn;
  baseLogPath    = fs.realpathSync(process.env.PWD) + "/" + Meteor.settings.paths.automation_logs + "/launcher/";
  automationPath = fs.realpathSync(process.env.PWD) + "/" + Meteor.settings.paths.automation + "/";

  Meteor.log.info("ProcessLauncher logPath: " + baseLogPath);
  Meteor.log.info("ProcessLauncher automationPath: " + automationPath);

  // Make sure the log path exists
  if(!fs.existsSync(baseLogPath)){
    Meteor.log.debug("ProcessLauncher creating log directory: " + baseLogPath);
    fs.mkdirSync(baseLogPath);
  }

});

/**
 * Functionality for launching and kill child processes
 */
ProcessLauncher = {
  testRoleScript: "roba_test_role.js",
  adventureScript: "roba_adventure.js",

  /**
   * Launch an automation process
   * This can be a test or adventure
   * @param command
   * @param logFileName
   * @param exitListener
   */
  launchAutomation: function (command, logFileName, exitListener) {
    Meteor.log.info("launchAutomation: " + command);

    // create a log file path
    var logFilePath = baseLogPath + logFileName,
      out = fs.openSync(logFilePath, "a"),
      err = fs.openSync(logFilePath, "a");

    // if the helper is not running, launch locally
    var script = command.split(" ")[0],
      args = command.split(" ").slice(1),
      proc = spawn("node", [automationPath + script].concat(args), {
      stdio: [ 'ignore', out, err ]
    });

    Meteor.log.debug("Process Launched: " + proc.pid, automationPath + command);

    // Catch the exit
    proc.on("exit", Meteor.bindEnvironment(exitListener || function (code) {
        Meteor.log.debug("Process Exit: " + proc.pid + ", " + code);
      }));

    return proc;
  }
};
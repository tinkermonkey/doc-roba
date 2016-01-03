/**
 * Handle the launching of various child processes
 */
Meteor.startup(function () {
  ProcessLauncher.init();
});

/**
 * Functionality for launching and kill child processes
 */
ProcessLauncher = {
  testRoleScript: "roba_test_role.js",
  adventureScript: "roba_adventure.js",

  /**
   * Initialize the Process Launcher
   */
  init: function () {
    this.baseLogPath       = path.join(DocRoba.rootPath, Meteor.settings.paths.automation_logs);
    this.launcherLogPath   = path.join(DocRoba.rootPath, Meteor.settings.paths.automation_logs, "launcher");
    this.automationPath    = path.join(DocRoba.rootPath, Meteor.settings.paths.automation);
    this.imageAnalysisPath = path.join(DocRoba.rootPath, Meteor.settings.paths.image_analysis);

    Meteor.log.info("ProcessLauncher.init logPath: " + this.baseLogPath);
    Meteor.log.info("ProcessLauncher.init automationPath: " + this.automationPath);
    Meteor.log.info("ProcessLauncher.init imageAnalysisPath: " + this.imageAnalysisPath);

    // Make sure the log path exists
    if(!fs.existsSync(this.baseLogPath)){
      Meteor.log.debug("ProcessLauncher creating log directory: " + this.baseLogPath);
      fs.mkdirSync(this.baseLogPath);
    }
    if(!fs.existsSync(this.launcherLogPath)){
      Meteor.log.debug("ProcessLauncher creating log directory: " + this.launcherLogPath);
      fs.mkdirSync(this.launcherLogPath);
    }
  },

  /**
   * Launch an automation process
   * This can be a test or adventure
   * @param command
   * @param logFileName
   * @param exitListener
   */
  launchAutomation: function (command, logFileName, exitListener) {
    Meteor.log.info("ProcessLauncher.launchAutomation: " + command);

    // create a log file path
    var logFilePath = path.join(this.launcherLogPath, logFileName),
      out = fs.openSync(logFilePath, "a"),
      err = fs.openSync(logFilePath, "a");

    // if the helper is not running, launch locally
    var script = command.split(" ")[0],
      args = command.split(" ").slice(1),
      proc = childProcess.spawn("node", [path.join(this.automationPath, script)].concat(args), {
      stdio: [ 'ignore', out, err ]
    });

    Meteor.log.debug("ProcessLauncher.launchAutomation Launched: " + proc.pid, this.automationPath + command);

    // Catch the exit
    proc.on("exit", Meteor.bindEnvironment(exitListener || function (code) {
        Meteor.log.debug("ProcessLauncher.launchAutomation Exit: " + proc.pid + ", " + code);
        try {
          out.close();
          err.close();
        } catch (e) {
          Meteor.log.error("ProcessLauncher.launchAutomation: " + e.toString());
        }
      }));

    return proc;
  },

  /**
   * Launch an image analysis process
   * @param command
   * @param logFileName
   * @param callback
   */
  launchImageTask: function (command, logFileName, callback) {
    Meteor.log.info("ProcessLauncher.launchImageTask: " + command);

    // create a log file path
    var logFilePath = path.join(this.launcherLogPath, logFileName),
      out = fs.openSync(logFilePath, "w"),
      err = fs.openSync(logFilePath, "a");

    // if the helper is not running, launch locally
    var script = command.split(" ")[0],
      args = command.split(" ").slice(1),
      proc = childProcess.spawn("python", [path.join(this.imageAnalysisPath, script)].concat(args), {
      stdio: [ 'ignore', out, err ]
    });

    Meteor.log.debug("ProcessLauncher.launchImageTask Launched: " + proc.pid,  "python " + this.imageAnalysisPath + command);

    // Catch the exit
    proc.on("exit", Meteor.bindEnvironment(function (code) {
        Meteor.log.debug("ProcessLauncher.launchImageTask Exit: " + proc.pid + ", " + code);

        // grab the output
        if(callback){
          fs.close(out);
          fs.close(err);
          var output = fs.readFileSync(logFilePath, {encoding: 'utf8'});
          callback(output);
        }
      }));

    return proc;
  }
};
import { Meteor } from 'meteor/meteor';
import { DocRoba } from '../doc_roba.js';
let fs           = require('fs'),
    path         = require('path'),
    childProcess = require("child_process");

/**
 * Handle the launching of various child processes
 */
Meteor.startup(() => {
  ProcessLauncher.init();
});

/**
 * Functionality for launching and kill child processes
 */
export const ProcessLauncher = {
  testRoleScript : "execute_test_role.js",
  adventureScript: "execute_adventure.js",
  
  /**
   * Initialize the Process Launcher
   */
  init() {
    this.baseLogPath       = path.join(DocRoba.basePath, Meteor.settings.paths.automation_logs);
    this.launcherLogPath   = path.join(DocRoba.basePath, Meteor.settings.paths.automation_logs, "launcher");
    this.automationPath    = path.join(DocRoba.basePath, Meteor.settings.paths.automation);
    this.imageAnalysisPath = path.join(DocRoba.basePath, Meteor.settings.paths.image_analysis);
    
    console.info("ProcessLauncher.init logPath: " + this.baseLogPath);
    console.info("ProcessLauncher.init automationPath: " + this.automationPath);
    console.info("ProcessLauncher.init imageAnalysisPath: " + this.imageAnalysisPath);
    
    // Make sure the log path exists
    if (!fs.existsSync(this.baseLogPath)) {
      console.debug("ProcessLauncher creating log directory: " + this.baseLogPath);
      fs.mkdirSync(this.baseLogPath);
    }
    if (!fs.existsSync(this.launcherLogPath)) {
      console.debug("ProcessLauncher creating log directory: " + this.launcherLogPath);
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
  launchAutomation(command, logFileName, exitListener) {
    console.info("ProcessLauncher.launchAutomation: " + command);
    
    // create a log file path
    let logFilePath = this.getFullLogPath(logFileName),
        out         = fs.openSync(logFilePath, "a"),
        err         = fs.openSync(logFilePath, "a"),
        script      = command.split(" ")[ 0 ],
        args        = command.split(" ").slice(1),
        proc        = childProcess.spawn("node", [ path.join(this.automationPath, script) ].concat(args), {
          stdio: [ 'ignore', out, err ]
        });
    
    console.debug("ProcessLauncher.launchAutomation Launched: " + proc.pid, this.automationPath, command);
    
    // Catch the exit to shut down the output capture
    proc.on("exit", Meteor.bindEnvironment(function (code) {
          console.debug("ProcessLauncher.launchAutomation Exit: " + proc.pid + ", " + code);
          try {
            fs.close(out);
            fs.close(err);
          } catch (e) {
            console.error("ProcessLauncher.launchAutomation encountered an error on exit: " + e.toString());
          }
      
          // Call the exit listener if there is one
          exitListener && exitListener(code)
        }));
    
    return proc;
  },
  
  /**
   * Launch an image analysis process
   * @param command
   * @param logFileName
   * @param callback
   */
  launchImageTask(command, logFileName, callback) {
    console.info("ProcessLauncher.launchImageTask: " + command);
    
    // create a log file path
    let logFilePath = this.getFullLogPath(logFileName),
        out         = fs.openSync(logFilePath, "w"),
        err         = fs.openSync(logFilePath, "a"),
        script      = command.split(" ")[ 0 ],
        args        = command.split(" ").slice(1),
        proc        = childProcess.spawn("python", [ path.join(this.imageAnalysisPath, script) ].concat(args), {
          stdio: [ 'ignore', out, err ]
        });
    
    console.debug("ProcessLauncher.launchImageTask Launched: " + proc.pid, "python " + this.imageAnalysisPath + command);
    
    // Catch the exit
    proc.on("exit", Meteor.bindEnvironment((code) => {
      console.debug("ProcessLauncher.launchImageTask Exit: " + proc.pid + ", " + code);
      
      // grab the output
      if (callback) {
        fs.close(out);
        fs.close(err);
        let output = fs.readFileSync(logFilePath, { encoding: 'utf8' });
        callback(output);
      }
    }));
    
    return proc;
  },
  
  /**
   * Get the full path to a launcher log file
   * @param logFileName
   */
  getFullLogPath(logFileName){
    return path.join(this.launcherLogPath, logFileName)
  },
  
  /**
   * Recursively remove files in the path provided
   * @param dirPath
   */
  removeLogPath(dirPath){
    console.info("ProcessLauncher.removeLogPath:", dirPath);
    let self = this;
    try {
      // Validate that it's in an acceptable sub-path
      if (path.isAbsolute(dirPath)) {
        if (path.parse(dirPath).dir.match('^' + self.baseLogPath)) {
          if (fs.existsSync(dirPath)) {
            // If it's a directory, remove all of the files and folders first
            if (fs.lstatSync(dirPath).isDirectory()) {
              fs.readdirSync(dirPath).forEach(function (entry) {
                let subPath = path.join(dirPath, entry);
                if (fs.lstatSync(subPath).isDirectory()) {
                  self.removeLogPath(subPath);
                } else {
                  console.debug("ProcessLauncher.removeLogPath removing file:", subPath);
                  fs.unlinkSync(subPath);
                }
              });
              fs.rmdirSync(dirPath);
            } else {
              // If it's a file just remove it
              fs.unlinkSync(dirPath);
            }
          } else {
            console.error("ProcessLauncher.removeLogPath path does not exist:", dirPath);
          }
        } else {
          console.error("ProcessLauncher.removeLogPath only accepts sub-paths of this path:", self.baseLogPath, dirPath, path.parse(dirPath).dir, path.parse(dirPath)
              .dir.match('^' + self.baseLogPath));
        }
      } else {
        console.error("ProcessLauncher.removeLogPath only accepts absolute paths:", dirPath);
      }
    } catch (e) {
      console.error('ProcessLauncher.removeLogPath failed to remove path:', dirPath, e);
    }
  }
};
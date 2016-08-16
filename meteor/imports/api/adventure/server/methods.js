import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Accounts} from 'meteor/accounts-base';
import {ProcessLauncher} from '../../process_launcher/process_launcher.js';
var childProcess  = Npm.require("child_process");

// Collections
import {Adventures} from '../adventure.js';
import {AdventureCommands} from '../adventure_command.js';
import {AdventureStates} from '../adventure_state.js';
import {AdventureSteps} from '../adventure_step.js';
import {Nodes} from '../../node/node.js';

// Enums
import {AdventureStatus} from '../adventure_status.js';
import {AdventureStepStatus} from '../adventure_step_status.js';

Meteor.methods({
  /**
   * prepareAdventure
   * @param adventureId
   */
  launchAdventure(adventureId) {
    if(!adventureId) { throw new Meteor.Error("launchAdventure failed: no adventureId specified")}
  
    console.debug("launchAdventure: " + adventureId);
    var adventure = Adventures.findOne(adventureId);
    if(!adventure) { throw new Meteor.Error("launchAdventure failed: adventure [" + adventureId + "] not found")}
  
    // Queue the adventure
    Adventures.update(adventureId, {$set: {status: AdventureStatus.staged }});
    AdventureSteps.update({adventureId: adventureId }, {$set: {status: AdventureStepStatus.staged }});
  
    var token = Accounts.singleUseAuth.generate({ expires: { seconds: 5 } }, Meteor.user()),
        command = [ProcessLauncher.adventureScript, "--adventureId", adventureId, "--token", token].join(" "),
        logFile = ["adventure_", adventureId, ".log"].join(""),
        proc = ProcessLauncher.launchAutomation(command, logFile, (code) => {
          console.debug("Adventure Exit: " + adventure._id + ", " + code);
          Adventures.update(adventure._id , {$unset: {pid: ""}});
          if(code){
            Adventures.update(adventure._id , {$set: {status: AdventureStatus.failed}});
          } else {
            Adventures.update({_id: adventure._id, status: {$nin: [AdventureStatus.failed]} }, {$set: {status: AdventureStatus.complete}});
          }
        });
  
    Adventures.update(adventureId, {$set: {pid: proc.pid}});
    console.info("launchAdventure launched: " + adventureId + " as " + proc.pid + " > " + logFile);
  },

  /**
   * abortAdventure
   * @param adventureId
   */
  abortAdventure(adventureId) {
    check(adventureId, String);
  
    console.debug("abortAdventure: " + adventureId);
    var adventure = Adventures.findOne(adventureId);
    if(adventure){
      Adventures.update({_id: adventure._id}, {$set: {status: AdventureStatus.complete, abort: true}});
  
      // give it a few seconds, but make sure the process ends
      if(adventure.pid){
        Meteor.setTimeout(() => {
          // get the updated record
          adventure = Adventures.findOne(adventureId);
      
          // check to see if the process has exited
          if(adventure.pid){
            console.debug("Looks like adventure " + adventure._id + " may still be alive as pid " + adventure.pid);
        
            // make sure it's dead
            console.debug("Killing adventure " + adventure._id + ", " + adventure.pid);
            childProcess.exec("kill " + adventure.pid, (error, stdout, stderr) => {
              if(error){
                console.error("Killing adventure failed: ", error);
              } else {
                console.log("Adventure killed:");
                console.log("stdout: ", stdout.toString());
                console.log("stderr: ", stderr.toString());
              }
            });
          } else {
            console.debug("Adventure abort watchdog: adventure " + adventure._id + " looks dead");
          }
        }, 10000);
      } else {
        console.error("Abort Adventure: No PID for adventure " + adventureId);
      }
    } else {
      console.error("Adventure not found: " + adventureId);
    }
  },

  /**
   * pauseAdventure
   * @param adventureId
   */
  pauseAdventure(adventureId) {
    check(adventureId, String);
  
    console.debug("pauseAdventure: " + adventureId);
    Adventures.update(adventureId, {$set: { status: AdventureStatus.paused }})
  },

  /**
   * Send the adventure status enum to the clients
   * @returns {AdventureStatus|*}
   */
  loadAdventureEnums() {
    return {
      status: AdventureStatus,
      stepStatus: AdventureStepStatus
    };
  },

  /**
   * Set the status of an adventure
   * @param adventureId
   * @param status
   */
  setAdventureStatus(adventureId, status) {
    console.debug("setAdventureStatus: " + adventureId + ", " + status);
    check(adventureId, String);
    check(status, Number);
  
    var adventure = Adventures.findOne({_id: adventureId});
    check(adventure, Object);
    Adventures.update({_id: adventure._id}, {$set: {status: status}});
  },

  /**
   * Store the current state of an adventure
   * @param adventureId
   * @param state
   */
  saveAdventureState(adventureId, state) {
    console.debug("saveAdventureState: " + adventureId);
    check(adventureId, String);
    check(state, Object);
    AdventureStates.upsert({adventureId: adventureId}, {$set: state});
  },

  /**
   * Set the known location of an adventure
   * @param adventureId
   * @param nodeId
   */
  setAdventureLocation(adventureId, nodeId) {
    console.debug("setAdventureLocation: " + adventureId + ", " + nodeId);
    check(adventureId, String);
    check(nodeId, String);
  
    var adventure = Adventures.findOne({_id: adventureId});
    check(adventure, Object);
    Adventures.update({_id: adventure._id}, {$set: {lastKnownNode: nodeId}});
  },

  /**
   * Set the log file path for an adventure
   * @param adventureId
   * @param path
   */
  setAdventureLogFile(adventureId, path) {
    console.debug("setAdventureLogFile: " + adventureId + ", " + path);
    check(adventureId, String);
    check(path, String);
  
    Adventures.update({_id: adventureId}, {$set: {logFile: path}});
  },

  /**
   * Set the status of an adventure step
   * @param stepId
   * @param status
   */
  setAdventureStepStatus(stepId, status) {
    console.debug("setAdventureStepStatus: " + stepId + ", " + status);
    check(stepId, String);
    check(status, Number);
  
    var step = AdventureSteps.findOne({_id: stepId});
    check(step, Object);
  
    AdventureSteps.update({_id: step._id}, {$set: {status: status}});
  },

  /**
   * Save a result from an adventure step
   * @param stepId
   * @param type
   * @param result
   */
  saveAdventureStepResult(stepId, type, result) {
    console.debug("saveAdventureStepResult: " + stepId + ", " + type);
    check(stepId, String);
    check(type, String);
  
    var step = AdventureSteps.findOne({_id: stepId});
    check(step, Object);
  
    var stepResult = step.result || {};
  
    if(!stepResult[type]){
      stepResult[type] = [];
    }
  
    stepResult[type].push(result);
  
    AdventureSteps.update({_id: step._id}, {$set: {result: stepResult}});
  },

  /**
   * Set the status of an adventure command
   * @param commandId
   * @param status
   * @param result
   */
  setCommandStatus(commandId, status, result) {
    console.debug("setCommandStatus: " + commandId + ", " + status);
    check(commandId, String);
    check(status, Number);
  
    // Load the command
    var command = AdventureCommands.findOne({_id: commandId});
    check(command, Object);
  
    // Don't write the result unless it exists to prevent losing an existing result
    if(result){
      // force the result to an object
      var saveResult = result;
      if(_.isArray(result) || !_.isObject(saveResult)){
        saveResult = {
          result: result
        };
      }
    
      AdventureCommands.update({_id: command._id}, {$set: {status: status, result: saveResult}});
    } else {
      AdventureCommands.update({_id: command._id}, {$set: {status: status}});
    }
  },

  /**
   * Return a single static record of a node
   * @param staticId
   * @param projectVersionId
   */
  loadNode(staticId, projectVersionId) {
    console.debug("loadNode: " + staticId + ", " + projectVersionId);
    return Nodes.findOne({staticId: staticId, projectVersionId: projectVersionId});
  },

  /**
   * Respond to a heartbeat request keeping the DDP connection alive
   */
  heartbeat() {
    return "ACK";
  }
});

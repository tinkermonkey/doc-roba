import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Auth } from '../../auth.js';
import { ProcessLauncher } from '../../process_launcher/process_launcher.js';
import '../../single_use_auth/single_use_auth.js';
import { Adventures } from '../adventures.js';
import { AdventureCommands } from '../adventure_commands.js';
import { AdventureStates } from '../adventure_states.js';
import { AdventureSteps } from '../adventure_steps.js';
import { NodeCheckTypes } from '../../nodes/node_check_types.js';
import { AdventureStatus } from '../adventure_status.js';
import { AdventureStepStatus } from '../adventure_step_status.js';
var childProcess = require("child_process");

// Collections

// Enums

Meteor.methods({
  /**
   * Launch an adventure
   * @param projectId
   * @param adventureId
   */
  launchAdventure(projectId, adventureId) {
    console.debug("launchAdventure:", projectId, adventureId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      // Load the adventure Record
      let adventure = Adventures.findOne({ projectId: projectId, _id: adventureId });
      if (!adventure) {
        throw new Meteor.Error("launchAdventure failed: adventure [" + adventureId + "] not found for project" + projectId)
      }
      
      // Queue the adventure
      Adventures.update(adventure._id, { $set: { status: AdventureStatus.staged } });
      AdventureSteps.update({ adventureId: adventure._id }, { $set: { status: AdventureStepStatus.staged } });
      
      // Generate the authentication token and launch the process
      let token   = Accounts.singleUseAuth.generate({ expires: { seconds: 30 } }, Meteor.user()),
          command = [ ProcessLauncher.adventureScript, "--adventureId", adventure._id, "--projectId", adventure.projectId, "--token", token ].join(" "),
          logFile = [ "adventure_", adventure._id, ".log" ].join(""),
          proc    = ProcessLauncher.launchAutomation(command, logFile, (code) => {
            console.debug("Adventure Exit: " + adventure._id + ", " + code);
            Adventures.update(adventure._id, { $unset: { pid: "" } });
            if (code) {
              Adventures.update(adventure._id, { $set: { status: AdventureStatus.failed } });
            } else {
              Adventures.update({
                _id   : adventure._id,
                status: { $nin: [ AdventureStatus.failed ] }
              }, { $set: { status: AdventureStatus.complete } });
            }
          });
      
      // Store the PID
      Adventures.update(adventure._id, { $set: { pid: proc.pid } });
      console.info("launchAdventure launched: " + adventure._id + " as " + proc.pid + " > " + logFile);
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Stop an adventure
   * @param projectId
   * @param adventureId
   */
  abortAdventure(projectId, adventureId) {
    console.debug("launchAdventure:", projectId, adventureId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let adventure = Adventures.findOne({ projectId: projectId, _id: adventureId });
      
      if (!adventure) {
        throw new Meteor.error("404", "Not found", "No Adventure found for id [" + adventureId + "] and project [" + projectId + "]");
      }
      
      Adventures.update({ _id: adventure._id }, { $set: { status: AdventureStatus.complete, abort: true } });
      
      // give it a few seconds, but make sure the process ends
      if (adventure.pid) {
        Meteor.setTimeout(() => {
          // get the updated record
          adventure = Adventures.findOne(adventureId);
          
          // check to see if the process has exited
          if (adventure.pid) {
            console.debug("Looks like adventure " + adventure._id + " may still be alive as pid " + adventure.pid);
            
            // make sure it's dead
            console.debug("Killing adventure " + adventure._id + ", " + adventure.pid);
            childProcess.exec("kill " + adventure.pid, (error, stdout, stderr) => {
              if (error) {
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
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Pause an adventure
   * @param projectId
   * @param adventureId
   */
  pauseAdventure(projectId, adventureId) {
    console.debug("pauseAdventure:", projectId, adventureId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = Adventures.update({ projectId: projectId, _id: adventureId }, { $set: { status: AdventureStatus.paused } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No Adventure found for id [" + adventureId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Send the enums needed for an adventure to the adventure client
   * @returns Object
   */
  loadAdventureEnums() {
    return {
      AdventureStatus    : AdventureStatus,
      AdventureStepStatus: AdventureStepStatus,
      NodeCheckTypes     : NodeCheckTypes
    };
  },
  
  /**
   * Set the status of an adventure
   * @param projectId
   * @param adventureId
   * @param status
   */
  setAdventureStatus(projectId, adventureId, status) {
    console.debug("setAdventureStatus:", projectId, adventureId, status);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    check(status, Number);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = Adventures.update({ projectId: projectId, _id: adventureId }, { $set: { status: status } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No Adventure found for id [" + adventureId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Store the current state of an adventure
   * @param projectId
   * @param adventureId
   * @param state
   */
  saveAdventureState(projectId, adventureId, state) {
    console.debug("saveAdventureState:", projectId, adventureId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    check(state, Object);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      AdventureStates.upsert({ projectId: projectId, adventureId: adventureId }, { $set: state });
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the known location of an adventure
   * @param projectId
   * @param adventureId
   * @param nodeId
   */
  setAdventureLocation(projectId, adventureId, nodeId) {
    console.debug("setAdventureLocation:", projectId, adventureId, nodeId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    check(nodeId, String);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = Adventures.update({ projectId: projectId, _id: adventureId }, { $set: { lastKnownNode: nodeId } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No Adventure found for id [" + adventureId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the log file path for an adventure
   * @param projectId
   * @param adventureId
   * @param path
   */
  setAdventureLogFile(projectId, adventureId, path) {
    console.debug("setAdventureLogFile:", projectId, adventureId, path);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(adventureId, String);
    check(path, String);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = Adventures.update({ projectId: projectId, _id: adventureId }, { $set: { logFile: path } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No Adventure found for id [" + adventureId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the status of an adventure step
   * @param projectId
   * @param stepId
   * @param status
   */
  setAdventureStepStatus(projectId, stepId, status) {
    console.debug("setAdventureStepStatus:", projectId, stepId, status);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(stepId, String);
    check(status, Number);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = AdventureSteps.update({ projectId: projectId, _id: stepId }, { $set: { status: status } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No AdventureStep found for id [" + stepId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Save a result from an adventure step
   * @param projectId
   * @param stepId
   * @param result
   */
  saveAdventureStepResult(projectId, stepId, result) {
    console.debug("saveAdventureStepResult:", projectId, stepId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(stepId, String);
    check(result, Object);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = AdventureSteps.update({ projectId: projectId, _id: stepId }, { $set: { result: result } });
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No AdventureStep found for id [" + stepId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the status of an adventure command
   * @param projectId
   * @param commandId
   * @param status
   * @param result
   */
  setCommandStatus(projectId, commandId, status, result) {
    console.debug("setCommandStatus:", projectId, commandId, status);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(commandId, String);
    check(status, Number);
    
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      // Load the command
      let command = AdventureCommands.findOne({ projectId: projectId, _id: commandId }),
          updateCount;
      
      // Don't write the result unless it exists to prevent losing an existing result
      if (result) {
        // force the result to an object
        let saveResult = result;
        if (_.isArray(result) || !_.isObject(saveResult)) {
          saveResult = {
            result: result
          };
        }
        
        updateCount = AdventureCommands.update({ projectId: projectId, _id: command._id }, {
          $set: {
            status: status,
            result: saveResult
          }
        });
      } else {
        updateCount = AdventureCommands.update({ projectId: projectId, _id: command._id }, { $set: { status: status } });
      }
      
      if (!updateCount) {
        throw new Meteor.error("404", "Not found", "No AdventureCommand found for id [" + commandId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
    
  },
  
  /**
   * Respond to a heartbeat request keeping the DDP connection alive
   */
  heartbeat() {
    return "ACK";
  }
});

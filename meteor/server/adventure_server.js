/**
 * Methods and publications to enable the adventure execution
 */
Meteor.startup(function () {
  /**
   * Publications
   */
  Meteor.publish('adventure', function (adventureId) {
    return Collections.Adventures.find({_id: adventureId});
  });
  Meteor.publish('adventure_test_system', function (testSystemId) {
    return Collections.TestSystems.find({staticId: testSystemId});
  });
  Meteor.publish('adventure_test_agent', function (testAgentId) {
    return Collections.TestAgents.find({staticId: testAgentId});
  });
  Meteor.publish('adventure_server', function (serverId) {
    return Collections.Servers.find({staticId: serverId});
  });
  Meteor.publish('adventure_state', function (adventureId) {
    return Collections.AdventureStates.find({adventureId: adventureId});
  });
  Meteor.publish('adventures', function () {
    return Collections.Adventures.find({});
  });
  Meteor.publish('adventure_log', function (adventureId, limit) {
    limit = limit || 100;
    var options = {sort: { timestamp: -1 }};
    if(limit > 0){
      options.limit = limit;
    }
    //console.log('adventure_log:', adventureId, limit, options);
    return Collections.LogMessages.find({
      "context.adventureId": adventureId
    }, options);
  });
  Meteor.publish('adventure_actions', function (adventureId) {
    return Collections.AdventureSteps.find({adventureId: adventureId}, {sort: {order: 1}});
  });
  Meteor.publish('adventure_commands', function (adventureId) {
    return Collections.AdventureCommands.find({adventureId: adventureId}, {sort: {dateCreated: 1}});
  });

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
    /**
     * prepareAdventure
     * @param adventureId
     */
    launchAdventure: function (adventureId) {
      if(!adventureId) { throw new Meteor.Error("launchAdventure failed: no adventureId specified")}

      Meteor.log.debug("launchAdventure: " + adventureId);
      var adventure = Collections.Adventures.findOne(adventureId);
      if(!adventure) { throw new Meteor.Error("launchAdventure failed: adventure [" + adventureId + "] not found")}

      // Queue the adventure
      Collections.Adventures.update(adventureId, {$set: {status: AdventureStatus.staged }});
      Collections.AdventureSteps.update({adventureId: adventureId }, {$set: {status: AdventureStepStatus.staged }});

      var token = Accounts.singleUseAuth.generate({ expires: { seconds: 5 } }, Meteor.user()),
        command = [ProcessLauncher.adventureScript, "--adventureId", adventureId, "--token", token].join(" "),
        logFile = ["adventure_", adventureId, ".log"].join(""),
        proc = ProcessLauncher.launchAutomation(command, logFile, function (code) {
          var adventure = this;
          Meteor.log.debug("Adventure Exit: " + adventure._id + ", " + code);
          Collections.Adventures.update(adventure._id , {$unset: {pid: ""}});
          if(code){
            Collections.Adventures.update(adventure._id , {$set: {status: AdventureStatus.failed}});
          } else {
            Collections.Adventures.update({_id: adventure._id, status: {$nin: [AdventureStatus.failed]} }, {$set: {status: AdventureStatus.complete}});
          }
        }.bind(adventure));

      Collections.Adventures.update(adventureId, {$set: {pid: proc.pid}});
      Meteor.log.info("launchAdventure launched: " + adventureId + " as " + proc.pid + " > " + logFile);
    },

    /**
     * abortAdventure
     * @param adventureId
     */
    abortAdventure: function (adventureId) {
      check(adventureId, String);

      Meteor.log.debug("abortAdventure: " + adventureId);
      abortAdventure(adventureId);
    },

    /**
     * pauseAdventure
     * @param adventureId
     */
    pauseAdventure: function (adventureId) {
      check(adventureId, String);

      Meteor.log.debug("pauseAdventure: " + adventureId);
      Collections.Adventures.update(adventureId, {$set: { status: AdventureStatus.paused }})
    },

    /**
     * Send the adventure status enum to the clients
     * @returns {AdventureStatus|*}
     */
    loadAdventureEnums: function () {
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
    setAdventureStatus: function (adventureId, status) {
      Meteor.log.debug("setAdventureStatus: " + adventureId + ", " + status);
      check(adventureId, String);
      check(status, Number);

      var adventure = Collections.Adventures.findOne({_id: adventureId});
      check(adventure, Object);
      Collections.Adventures.update({_id: adventure._id}, {$set: {status: status}});
    },

    /**
     * Store the current state of an adventure
     * @param adventureId
     * @param state
     */
    saveAdventureState: function (adventureId, state) {
      Meteor.log.debug("saveAdventureState: " + adventureId);
      check(adventureId, String);
      check(state, Object);
      Collections.AdventureStates.upsert({adventureId: adventureId}, {$set: state});
    },

    /**
     * Set the known location of an adventure
     * @param adventureId
     * @param nodeId
     */
    setAdventureLocation: function (adventureId, nodeId) {
      Meteor.log.debug("setAdventureLocation: " + adventureId + ", " + nodeId);
      check(adventureId, String);
      check(nodeId, String);

      var adventure = Collections.Adventures.findOne({_id: adventureId});
      check(adventure, Object);
      Collections.Adventures.update({_id: adventure._id}, {$set: {lastKnownNode: nodeId}});
    },

    /**
     * Set the log file path for an adventure
     * @param adventureId
     * @param path
     */
    setAdventureLogFile: function (adventureId, path) {
      Meteor.log.debug("setAdventureLogFile: " + adventureId + ", " + path);
      check(adventureId, String);
      check(path, String);

      Collections.Adventures.update({_id: adventureId}, {$set: {logFile: path}});
    },

    /**
     * Set the status of an adventure step
     * @param stepId
     * @param status
     * @param result
     */
    setAdventureStepStatus: function (stepId, status) {
      Meteor.log.debug("setAdventureStepStatus: " + stepId + ", " + status);
      check(stepId, String);
      check(status, Number);

      var step = Collections.AdventureSteps.findOne({_id: stepId});
      check(step, Object);

      Collections.AdventureSteps.update({_id: step._id}, {$set: {status: status}});
    },

    /**
     * Save a result from an adventure step
     * @param stepId
     * @param type
     * @param result
     */
    saveAdventureStepResult: function(stepId, type, result) {
      Meteor.log.debug("saveAdventureStepResult: " + stepId + ", " + type);
      check(stepId, String);
      check(type, String);

      var step = Collections.AdventureSteps.findOne({_id: stepId});
      check(step, Object);

      var stepResult = step.result || {};

      if(!stepResult[type]){
        stepResult[type] = [];
      }

      stepResult[type].push(result);

      Collections.AdventureSteps.update({_id: step._id}, {$set: {result: stepResult}});
    },

    /**
     * Set the status of an adventure command
     * @param commandId
     * @param status
     * @param result
     */
    setCommandStatus: function (commandId, status, result) {
      Meteor.log.debug("setCommandStatus: " + commandId + ", " + status);
      check(commandId, String);
      check(status, Number);

      // Load the command
      var command = Collections.AdventureCommands.findOne({_id: commandId});
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

        Collections.AdventureCommands.update({_id: command._id}, {$set: {status: status, result: saveResult}});
      } else {
        Collections.AdventureCommands.update({_id: command._id}, {$set: {status: status}});
      }
    },

    /**
     * Return a single static record of a node
     * @param staticId
     * @param projectVersionId
     */
    loadNode: function (staticId, projectVersionId) {
      Meteor.log.debug("loadNode: " + staticId + ", " + projectVersionId);
      return Collections.Nodes.findOne({staticId: staticId, projectVersionId: projectVersionId});
    },

    /**
     * Respond to a heartbeat request keeping the DDP connection alive
     */
    heartbeat: function () {
      return "ACK";
    }
  });
});

/**
 * Abort an adventure
 * @param adventureId
 */
abortAdventure = function (adventureId) {
  var adventure = Collections.Adventures.findOne(adventureId);
  if(adventure){
    Collections.Adventures.update({_id: adventure._id}, {$set: {status: AdventureStatus.complete, abort: true}});

    // give it a few seconds, but make sure the process ends
    if(adventure.pid){
      Meteor.setTimeout(function () {
        // get the updated record
        adventure = Collections.Adventures.findOne(adventureId);

        // check to see if the process has exited
        if(adventure.pid){
          Meteor.log.debug("Looks like adventure " + adventure._id + " may still be alive as pid " + adventure.pid);

          // make sure it's dead
          Meteor.log.debug("Killing adventure " + adventure._id + ", " + adventure.pid);
          exec("kill " + adventure.pid, function (error, stdout, stderr) {
            if(error){
              console.error("Killing adventure failed: ", error);
            } else {
              console.log("Adventure killed:");
              console.log("stdout: ", stdout.toString());
              console.log("stderr: ", stderr.toString());
            }
          });
        } else {
          Meteor.log.debug("Adventure abort watchdog: adventure " + adventure._id + " looks dead");
        }
      }, 10000);
    } else {
      Meteor.log.error("Abort Adventure: No PID for adventure " + adventureId);
    }
  } else {
    Meteor.log.error("Adventure not found: " + adventureId);
  }
};
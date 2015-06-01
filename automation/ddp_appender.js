"use strict";
var moment = require("moment"), adventureId, nodeId, actionId;

/**
 *
 */
exports.createAppender = function createAppender (ddpLink) {
  function logMsg (event) {
    return {
      adventureId: adventureId,
      nodeId: nodeId,
      actionId: actionId,
      timestamp: moment(event.startTime).valueOf(),
      level: event.level.levelStr,
      sender: event.categoryName,
      data: event.data
    };
  }

  return function(loggingEvent) {
    if(ddpLink){
      ddpLink.log(logMsg(loggingEvent));
    } else {
      console.log("event: ", logMsg(loggingEvent));
    }
  };
};

exports.setContext = function (adventure, node, action) {
  adventureId = adventure;
  nodeId = node;
  actionId = action;
};

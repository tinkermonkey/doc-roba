"use strict";

/**
 * Basic centralized context tracking for the automation
 */
var _    = require("underscore"),
    log4js = require("log4js"),
    logger = log4js.getLogger("context");

class RobaContext {
  /**
   * RobaContext
   * @param context
   */
  constructor (context) {
    this.context = context || {};
  }
  
  /**
   * Get a copy of the current context
   */
  get () {
    return this.clone(this.context);
  };
  
  /**
   * Update some of the context
   * @param updatedContext
   */
  update (updatedContext) {
    // break any references in the context
    var update = this.clone(updatedContext);
    _.extend(this.context, update);
  };
  
  /**
   * Overwrite the context
   * @param newContext
   */
  set (newContext) {
    this.context = this.clone(newContext)
  };
  
  /**
   * Remove a set of keys
   * @param keys
   */
  remove (keys) {
    var context = this;
    keys = _.isString(keys) ? [keys] : keys;
    _.each(keys, function (key) {
      if(context.context.hasOwnProperty(key)){
        delete context.context[key]
      }
    })
  };
  
  /**
   * Backup the context
   */
  backup () {
    this.backup = this.clone(this.context)
  };
  
  /**
   * Restore the backup the context
   */
  restore () {
    this.context = this.clone(this.backup)
  };
  
  /**
   * Log a milestone
   */
  milestone (data) {
    logger.info(data);
  };
  
  /**
   * Stupid (simple) method to deep clone without references
   * @param context
   */
  clone (context) {
    try{
      return JSON.parse(JSON.stringify(context))
    } catch (error) {
      logger.error("Failed to clone object: ", context)
    }
  };
}

module.exports = RobaContext;
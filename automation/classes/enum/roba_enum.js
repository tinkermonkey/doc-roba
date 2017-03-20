"use strict";

let _ = require('underscore');

/**
 * Enums loaded from the server
 */
class RobaEnum {
  constructor (name) {
    this.name     = name;
    this.isLoaded = false;
  }
  
  /**
   * Load the value from the server
   */
  load (serverLink, logger) {
    logger && logger.debug('RobaEnum.load:', this.name);
    let self = this,
        value;
    
    if (!self.isLoaded) {
      // Get the value of the enum
      value = serverLink.call("loadEnum", [ self.name ]);
      
      // Set the keys
      _.keys(value).forEach((key) => {
        logger && logger.trace('RobaEnum.load setting key:', self.name, key, value[ key ]);
        self[ key ] = value[ key ];
      });
    } else {
      logger && logger.debug('RobaEnum.load already loaded:', self.name);
    }
  }
}

module.exports = RobaEnum;
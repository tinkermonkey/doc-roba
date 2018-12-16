import { Meteor } from 'meteor/meteor';
import { FS } from 'meteor/cfs:base-package';
let fs   = require('fs'),
    path = require('path');

console.log("Initializing Logging...");

// get better server side logging
console.debug = console.log;

/**
 * Enable debug for the moment
 */
//FS.debug = true;

if (Meteor.isServer) {
  console.log("Initializing CFS...");

  // confirm that the filestore directory exists
  if(!fs.existsSync(path.join(process.env.PWD, "..", "filestore"))){
    try {
      console.log("Creating filestore directory:", path.join(process.env.PWD, "..", "filestore"));
      fs.mkdirSync(path.join(process.env.PWD, "..", "filestore"));
    } catch (e) {
      console.error("Initializing CFS failed, unable to create filestore directory:", e);
      throw e
    }
  }

  FS.basePath = fs.realpathSync(path.join(process.env.PWD, "..", "filestore")) + path.sep;
  console.log('FS.basePath:', FS.basePath);

  console.log("CFS Initialized");
}

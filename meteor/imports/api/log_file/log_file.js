import {FS} from 'meteor/cfs:base-package';
import {Auth} from '../_lib/auth.js';

/**
 * Log files from testing and adventures
 */
export const LogFiles = new FS.Collection("log_files", {
  stores: [new FS.Store.FileSystem("log_files", { path: FS.basePath + "log_files" })]
});
LogFiles.deny(Auth.ruleSets.deny.ifNoProjectAccess);
LogFiles.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * ============================================================================
 * Log files from testing and adventures
 * ============================================================================
 */
Collections.LogFiles = new FS.Collection("log_files", {
  stores: [new FS.Store.FileSystem("log_files", { path: FS.basePath + "log_files" })]
});
Collections.LogFiles.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.LogFiles.allow(Auth.ruleSets.allow.ifAuthenticated);

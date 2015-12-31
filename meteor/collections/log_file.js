/**
 * ============================================================================
 * Log files from testing and adventures
 * ============================================================================
 */
Collections.LogFiles = new FS.Collection("log_files", {
  stores: [new FS.Store.FileSystem("log_files", { path: FS.basePath + "log_files" })]
});
Collections.DataStoreRows.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.DataStoreRows.allow(Auth.ruleSets.allow.ifAuthenticated);

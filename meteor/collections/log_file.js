/**
 * ============================================================================
 * Log files from testing and adventures
 * ============================================================================
 */
LogFiles = new FS.Collection("log_files", {
  stores: [new FS.Store.FileSystem("log_files", { path: FS.basePath + "log_files" })]
});
LogFiles.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
LogFiles.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});

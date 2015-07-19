/**
 * Enable debug for the moment
 */
FS.debug = true;

// TODO: Make this dynamic or a setting
var basePath = "/Users/austinsand/Workspace/doc-roba/files/";

/**
 * Thumbnail processor
 */
var createThumb = function(fileObj, readStream, writeStream) {
  // Transform the image into a 200x200px thumbnail
  gm(readStream, fileObj.name()).resize("200", "200").stream().pipe(writeStream);
};

/**
 * ============================================================================
 * Screen shots from testing and adventures
 * ============================================================================
 */
ScreenShots = new FS.Collection("screenshots", {
  stores: [
    new FS.Store.FileSystem("thumbs", { path: basePath + "screenshot_thumbs", transformWrite: createThumb }),
    new FS.Store.FileSystem("screenshots", { path: basePath + "screenshots" })
  ]
});
ScreenShots.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
ScreenShots.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * Log files from testing and adventures
 * ============================================================================
 */
LogFiles = new FS.Collection("log_files", {
  stores: [new FS.Store.FileSystem("log_files", { path: basePath + "log_files" })]
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

/**
 * ============================================================================
 * Node Reference Documentation
 * ============================================================================
 */
ReferenceDocs = new FS.Collection("reference_docs", {
  stores: [new FS.Store.FileSystem("reference_docs", { path: basePath + "reference_docs" })]
});
ReferenceDocs.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
ReferenceDocs.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});

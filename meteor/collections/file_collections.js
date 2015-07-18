/**
 * Enable debug for the moment
 */
FS.debug = true;

var basePath = "/Users/austinsand/Workspace/doc-roba/files/";
/**
 * ============================================================================
 * Screen shots from testing and adventures
 * ============================================================================
 */
ScreenShots = new FS.Collection("screenshots", {
  stores: [new FS.Store.FileSystem("screenshots", {path: basePath + "screenshots"})]
});
ScreenShots.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
ScreenShots.deny({
  insert: denyIfNotAuthenticated,
  update: denyIfNotAuthenticated,
  remove: denyIfNotAuthenticated,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * Node Reference Documentation
 * ============================================================================
 */
ReferenceDocs = new FS.Collection("reference_docs", {
  stores: [new FS.Store.FileSystem("reference_docs", {path: basePath + "reference_docs"})]
});
ReferenceDocs.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
ReferenceDocs.deny({
  insert: denyIfNotAuthenticated,
  update: denyIfNotAuthenticated,
  remove: denyIfNotAuthenticated,
  fetch: ['projectId']
});

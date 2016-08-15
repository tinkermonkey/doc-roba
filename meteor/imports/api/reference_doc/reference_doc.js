import {FS} from 'meteor/cfs:base-package';
import {Auth} from '../_lib/auth.js';

/**
 * Node Reference Documentation
 */
export const ReferenceDocs = new FS.Collection("reference_docs", {
  stores: [new FS.Store.FileSystem("reference_docs", { path: FS.basePath + "reference_docs" })]
});
ReferenceDocs.deny(Auth.ruleSets.deny.ifNoProjectAccess);
ReferenceDocs.allow(Auth.ruleSets.allow.ifAuthenticated);

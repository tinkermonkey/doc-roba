import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {SchemaHelpers} from '../schema_helpers.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

import {CodeModuleFunctions} from './code_module_function.js';
import {CodeLanguages} from './code_languages.js';

// List the collections that can be parents to code modules for retrieving parent records
import {Nodes} from '../node/node.js';
import {ProjectVersion} from '../project/project_version.js';

/**
 * ============================================================================
 * CodeModule
 * ============================================================================
 */
export const CodeModule = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this module belongs
  projectId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the project version to which this module belongs
  projectVersionId: {
    type: String,
    index: true,
    denyUpdate: true,
    optional: true
  },
  // Link to the module's parent staticId
  parentId: {
    type: String,
    optional: true
  },
  parentCollectionName: {
    type: String,
    optional: true
  },
  // If a parent has more than one code module this can be used to differentiate
  type: {
    type: Number,
    denyUpdate: true,
    optional: true
  },
  // Variable name
  name: {
    type: String
  },
  language: {
    type: Number,
    allowedValues: _.values(CodeLanguages)
  },
  docs: {
    type: String,
    optional: true
  },
  stubbed: {
    type: Boolean,
    defaultValue: false
  },
  deleted: {
    type: Boolean,
    defaultValue: false
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const CodeModules = new Mongo.Collection("code_modules");
CodeModules.attachSchema(CodeModule);
CodeModules.deny(Auth.ruleSets.deny.ifNotTester);
CodeModules.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(CodeModules, "code_modules");

/**
 * Helpers
 */
CodeModules.helpers({
  functions(){
    let module = this;
    return CodeModuleFunctions.find({parentId: module.staticId, projectVersionId: module.projectVersionId}, {sort: {name: 1}});
  },
  parentRecord(){
    let module = this;
    if(module.parentId){
      let collection = eval(module.parentCollectionName);
      return collection.findOne({ $or: [
        {_id: module.parentId},
        {staticId: module.parentId}
      ], projectVersionId: module.projectVersionId
      });
    }
  }
});
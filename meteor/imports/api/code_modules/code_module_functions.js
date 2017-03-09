import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {SchemaHelpers} from '../schema_helpers.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

import {CodeModules} from './code_modules.js';
import {CodeModuleFunctionParams} from './code_module_function_params.js';
import {CodeLanguages} from './code_languages.js';

/**
 * ============================================================================
 * CodeModuleFunction
 * ============================================================================
 */
export const CodeModuleFunction = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this function belongs
  projectId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the project version to which this function belongs
  projectVersionId: {
    type: String,
    index: true,
    denyUpdate: true,
    optional: true
  },
  // Link to the function's parent module staticId
  parentId: {
    type: String
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
  code: {
    type: String,
    optional: true
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

export const CodeModuleFunctions = new Mongo.Collection("code_module_functions");
CodeModuleFunctions.attachSchema(CodeModuleFunction);
CodeModuleFunctions.deny(Auth.ruleSets.deny.ifNotTester);
CodeModuleFunctions.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(CodeModuleFunctions, "code_module_functions");

/**
 * Helpers
 */
CodeModuleFunctions.helpers({
  params(){
    let fn = this;
    return CodeModuleFunctionParams.find({parentId: fn.staticId, projectVersionId: fn.projectVersionId}, {sort: {order: 1}});
  },
  module(){
    let fn = this;
    return CodeModules.findOne({staticId: fn.parentId, projectVersionId: fn.projectVersionId});
  }
});
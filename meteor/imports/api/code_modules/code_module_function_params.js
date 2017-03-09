import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {SchemaHelpers} from '../schema_helpers.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

import {CodeModuleFunctions} from './code_module_functions.js';
import {FunctionParamTypes} from './function_param_types.js';

/**
 * ============================================================================
 * CodeModuleFunctionParam
 * ============================================================================
 */
export const CodeModuleFunctionParam = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this param belongs
  projectId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the project version to which this param belongs
  projectVersionId: {
    type: String,
    index: true,
    denyUpdate: true,
    optional: true
  },
  // Link to the param's parent function staticId
  parentId: {
    type: String
  },
  // Param name
  name: {
    type: String
  },
  type: {
    type: Number,
    allowedValues: _.values(FunctionParamTypes),
    defaultValue: FunctionParamTypes.boolean
  },
  optional: {
    type: Boolean,
    defaultValue: true
  },
  docs: {
    type: String,
    optional: true
  },
  order: {
    type: Number
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

export const CodeModuleFunctionParams = new Mongo.Collection("code_module_function_params");
CodeModuleFunctionParams.attachSchema(CodeModuleFunctionParam);
CodeModuleFunctionParams.deny(Auth.ruleSets.deny.ifNotTester);
CodeModuleFunctionParams.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(CodeModuleFunctionParams, "code_module_function_params");

/**
 * Helpers
 */
CodeModuleFunctionParams.helpers({
  fn(){
    let fn = this;
    return CodeModuleFunctions.findOne({staticId: fn.parentId, projectVersionId: fn.projectVersionId});
  }
});
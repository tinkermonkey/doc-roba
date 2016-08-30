import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Util} from '../util.js';
import {SchemaHelpers} from '../schema_helpers.js';


/**
 * ============================================================================
 * DatastoreDataType
 * ============================================================================
 */
export const DatastoreDataType = new SimpleSchema({});

export const DatastoreDataType = new Mongo.Collection("datastore_data_type");
DatastoreDataType.attachSchema(DatastoreDataType);

/**
 * Helpers
 */
DatastoreDataType.helpers({});
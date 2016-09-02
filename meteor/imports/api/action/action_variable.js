import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {FieldTypes} from '../datastore/field_types.js';

/**
 * A variable used in action code that can influence the action
 * @type {SimpleSchema}
 */
export const ActionVariable = new SimpleSchema({
  // Order to show it in, this has no practical purpose
  order: {
    type: Number
  },
  // Static ID of the node this route leads to
  name: {
    type: String
  },
  // The type of the variable
  type: {
    type: Number,
    allowedValues: _.values(FieldTypes)
  },
  // The custom type if this is complex
  dataTypeId: {
    type: String,
    optional: true
  },
  // The js code which tests this route
  varIsArray: {
    type: Boolean,
    defaultValue: false
  },
  // Default value
  defaultValue: {
    type: String,
    optional: true,
    defaultValue: ""
  }
});

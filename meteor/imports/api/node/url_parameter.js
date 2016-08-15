import {SimpleSchema} from 'meteor/aldeed:simple-schema';

/**
 * URL Parameter to help identify a web page
 */
export const UrlParameter = new SimpleSchema({
  order: {
    type: Number
  },
  // the parameter
  param: {
    type: String
  },
  // the value identifying this node
  value: {
    type: String,
    optional: true
  }
});
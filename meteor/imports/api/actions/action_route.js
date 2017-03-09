import {SimpleSchema} from 'meteor/aldeed:simple-schema';

/**
 * A route that an action can cause the user to take
 * @type {SimpleSchema}
 */
export const ActionRoute = new SimpleSchema({
  // Order of this route in the action's routes
  order: {
    type: Number
  },
  // Static ID of the node this route leads to
  nodeId: {
    type: String
  },
  // The js code which tests this route
  routeCode: {
    type: String,
    defaultValue: "",
    optional: true
  }
});

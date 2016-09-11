import {ReactiveVar} from 'meteor/reactive-var';

/**
 * Helper to assist in the creation of the correct context
 */
export default class RobaContext {
  /**
   * RobaContext
   * @param config
   */
  constructor (config) {
    try {
      var route = config.route.export();
  
      console.log("RobaContext Route: ", route);
  
      // Initialize the data context
      var defaultDataContext = {};
      _.each(route.steps, function (step) {
        defaultDataContext["step" + step.stepNum] = {};
      });
  
      this.projectId        = route.projectId;
      this.projectVersionId = route.projectVersionId;
      this.route            = new ReactiveVar(route);
      this.dataContext      = new ReactiveVar(config.dataContext || defaultDataContext);
      this.server           = new ReactiveVar(config.server);
      this.testAgent        = new ReactiveVar(config.testAgent);
      this.testSystem       = new ReactiveVar(config.testSystem);
    } catch (e) {
      console.error("RobaContext initialization failed:", e);
    }
  }
};
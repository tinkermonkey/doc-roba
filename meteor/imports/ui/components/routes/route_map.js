import './route_map.html';

import {Template} from 'meteor/templating';

import '../../components/svg_snippets/vertical_route_snippet.js';

/**
 * Template Helpers
 */
Template.RouteMap.helpers({
  getRouteSteps: function () {
    if(this.route){

      var steps = [],
        routeSteps = this.route.route;
      _.each(routeSteps, function (step, i) {
        if(i == 0){
          steps.push({
            actionId: step.action.staticId
          });
        } else if(i == routeSteps.length - 1) {
          // skip this
        } else {
          steps.push({
            nodeId: step.node.staticId,
            actionId: step.action.staticId
          });
        }
      });
      return steps
    }
  }
});

/**
 * Template Event Handlers
 */
Template.RouteMap.events({});

/**
 * Template Created
 */
Template.RouteMap.created = function () {
  
};

/**
 * Template Rendered
 */
Template.RouteMap.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.RouteMap.destroyed = function () {
  
};

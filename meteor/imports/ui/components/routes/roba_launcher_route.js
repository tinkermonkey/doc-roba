import './roba_launcher_route.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdventureRoute.helpers({
  getVarDataKey: function () {
    var variable = this,
        step = Template.parentData(1);

    return "step" + step.stepNum + "." + variable.name
  },
  getVarValue: function () {
    var variable = this,
      step = Template.parentData(1),
      dataContext = Template.parentData(3).dataContext.get();

    return dataContext["step" + step.stepNum][variable.name]
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureRoute.events({});

/**
 * Template Created
 */
Template.AdventureRoute.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureRoute.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureRoute.destroyed = function () {
  
};

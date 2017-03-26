import './roba_launcher_route.html';
import './route.css';
import { Template } from 'meteor/templating';
import { DocTreeConfig } from '../../lib/doc_tree/doc_tree_config.js';
import '../svg_snippets/standalone_node_snippet.js';

/**
 * Template Helpers
 */
Template.RobaLauncherRoute.helpers({
  getVarDataKey () {
    let variable = this,
        step     = Template.parentData(1);
    
    return "step" + step.stepNum + "." + variable.name
  },
  getVarValue () {
    let variable    = this,
        step        = Template.parentData(1),
        dataContext = Template.parentData(3).dataContext.get();
    
    return dataContext[ "step" + step.stepNum ][ variable.name ]
  }
});

/**
 * Template Event Handlers
 */
Template.RobaLauncherRoute.events({});

/**
 * Template Created
 */
Template.RobaLauncherRoute.created = function () {
  
};

/**
 * Template Rendered
 */
Template.RobaLauncherRoute.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.RobaLauncherRoute.destroyed = function () {
  
};

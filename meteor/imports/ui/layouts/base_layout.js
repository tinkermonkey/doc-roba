import './base_layout.html';
import '../lib/svg_defs/minimal_svg_defs.js';
import '../lib/svg_defs/standard_svg_defs.js';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.BaseLayout.helpers({
});

/**
 * Template Event Handlers
 */
Template.BaseLayout.events({});

/**
 * Template Created
 */
Template.BaseLayout.created = function () {
  var instance = this;
  instance.subscribe("user_data");

  instance.autorun(function () {
    let user = Meteor.user();
    if(user && user.projectList){
      // Need to pass in the projectList to maintain reactivity
      instance.subscribe("user_peers", user.projectList);
      instance.subscribe("projects", user.projectList);
      instance.subscribe("project_versions", user.projectList);
      instance.subscribe("changes", user.projectList);
    }
  });
};

/**
 * Template Rendered
 */
Template.BaseLayout.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.BaseLayout.destroyed = function () {
  
};

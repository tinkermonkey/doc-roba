import './logout.html';
import '../insecure.css';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.Logout.helpers({});

/**
 * Template Helpers
 */
Template.Logout.events({});

/**
 * Template Created
 */
Template.Logout.created = function () {
  
};

/**
 * Template Rendered
 */
Template.Logout.rendered = function () {
  setTimeout(function () {
    d3.selectAll(".login-container").classed("login-intro", true);
    d3.selectAll("#login-form-container").classed("hide", true);
    setTimeout(function() {
      FlowRouter.go("/login");
    }, 750);
  }, 1500);
};

/**
 * Template Destroyed
 */
Template.Logout.destroyed = function () {
  
};

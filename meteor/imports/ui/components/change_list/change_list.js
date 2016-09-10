import './change_list.html';
import './change_list.css';

import {Template} from 'meteor/templating';

import './default_change.js';
import './nodes_change.js';

/**
 * Template Helpers
 */
Template.change_list.helpers({
  changeTemplate() {
    var defaultTemplate = Template.default_change;
    //console.log("changeTemplate: ", this.collection);
    return Template[this.collection + "_change"] ? Template[this.collection + "_change"] : defaultTemplate;
  }
});

/**
 * Template Helpers
 */
Template.change_list.events({});

/**
 * Template Rendered
 */
Template.change_list.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.change_list.destroyed = function () {

};

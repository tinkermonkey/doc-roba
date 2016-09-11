import './datastore_row_form.html';

import {Template} from 'meteor/templating';
import {Autoform} from 'meteor/aldeed:autoform';

/**
 * Template Helpers
 */
Template.DatastoreRowForm.helpers({});

/**
 * Template Helpers
 */
Template.DatastoreRowForm.events({});

/**
 * Template Rendered
 */
Template.DatastoreRowForm.rendered = function () {
  let instance = Template.instance();

  setTimeout(function () {
    instance.$("input").first().focus()
  }, 200);
};

/**
 * Template Destroyed
 */
Template.DatastoreRowForm.destroyed = function () {

};

import './project_activity.html';

import {Template} from 'meteor/templating';

import {RecordChanges} from '../../../../api/change_tracker/record_change.js';

/**
 * Template Helpers
 */
Template.ProjectActivity.helpers({
  hasChanges: function () {
    return RecordChanges.find({ projectId: this._id }).count();
  },
  projectChanges: function () {
    return RecordChanges.find({ projectId: this._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.ProjectActivity.events({

});

/**
 * Template Rendered
 */
Template.ProjectActivity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ProjectActivity.destroyed = function () {

};

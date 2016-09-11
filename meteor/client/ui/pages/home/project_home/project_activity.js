import './project_activity.html';

import {Template} from 'meteor/templating';

import {RecordChanges} from '../../../../../imports/api/change_tracker/record_change.js';

import '../../../components/change_list/change_list.js';

/**
 * Template Helpers
 */
Template.ProjectActivity.helpers({
  hasChanges() {
    return RecordChanges.find({ projectId: this._id }).count();
  },
  projectChanges() {
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

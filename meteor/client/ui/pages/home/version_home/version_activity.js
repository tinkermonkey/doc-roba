import './version_activity.html';

import {Template} from 'meteor/templating';

import {RecordChanges} from '../../../../../imports/api/change_tracker/record_change.js';

import '../../../components/change_list/change_list.js';

/**
 * Template Helpers
 */
Template.VersionActivity.helpers({
  hasChanges() {
    return RecordChanges.find({ projectVersionId: this._id }).count();
  },
  versionChanges() {
    return RecordChanges.find({ projectVersionId: this._id }, { sort: { date: -1 } });
  }
});

/**
 * Template Helpers
 */
Template.VersionActivity.events({});

/**
 * Template Created
 */
Template.VersionActivity.created = function () {

};

/**
 * Template Rendered
 */
Template.VersionActivity.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.VersionActivity.destroyed = function () {

};

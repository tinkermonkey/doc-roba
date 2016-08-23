import './version_activity.html';

import {Template} from 'meteor/templating';

import {RecordChanges} from '../../../../api/change_tracker/record_change.js';

import '../../../components/change_list/change_list.js';

/**
 * Template Helpers
 */
Template.VersionActivity.helpers({
  hasChanges: function () {
    return RecordChanges.find({ projectVersionId: this._id }).count();
  },
  versionChanges: function () {
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

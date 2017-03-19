import './version_activity.html';
import { Template } from 'meteor/templating';
import { RecordChanges } from '../../../../../imports/api/change_tracker/record_changes.js';
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
  let instance = Template.instance();
  
  instance.autorun(() => {
    let data = Template.currentData();
    instance.subscribe('version_changes', data._id);
  })
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

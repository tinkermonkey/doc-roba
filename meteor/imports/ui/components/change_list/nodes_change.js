import './nodes_change.html';

import {Template} from 'meteor/templating';

import {Projects} from '../../../api/project/project.js';
import {ProjectVersions} from '../../../api/project/project_version.js';
import {ChangeTypes} from '../../../api/change_tracker/change_types.js';

/**
 * Template Helpers
 */
Template.nodes_change.helpers({
  /**
   * Pull in the retrieved record along with the
   */
  combineData() {
    var change = this;
    change.project = Projects.findOne({ _id: change.projectId });
    change.projectVersion = ProjectVersions.findOne({ _id: change.projectVersionId });
    return change;
  },
  isUpdated() {
    return this.type === ChangeTypes.updated;
  },
  isCreated() {
    return this.type === ChangeTypes.created;
  },
  isDestroyed() {
    return this.type === ChangeTypes.destroyed;
  }
});

/**
 * Template Helpers
 */
Template.nodes_change.events({});

/**
 * Template Rendered
 */
Template.nodes_change.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.nodes_change.destroyed = function () {

};

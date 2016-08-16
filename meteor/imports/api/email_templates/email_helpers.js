import {Meteor} from 'meteor/meteor';
import {Util} from '../util.js';

export const EmailHelpers = {
  projectUrl(projectId) {
    console.log("projectId:", projectId);
    return Util.buildUrl(Meteor.absoluteUrl(), "projects", projectId)
  }
};
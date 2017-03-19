import {Meteor} from 'meteor/meteor';
import {RecordChanges} from '../record_changes.js';

Meteor.publish("changes", function (projectList, limit) {
  console.debug("Publish: changes ", projectList, limit);
  if(this.userId){
    let user = Meteor.users.findOne(this.userId),
        limit = limit || 25;
    return RecordChanges.find({projectId: {$in: user.projectList || []}}, {limit: limit, sort:{date: -1}});
  }
  console.warn("Publish: changes returning nothing");
  return [];
});

Meteor.publish("version_changes", function (projectVersionId, limit) {
  console.debug("Publish: version_changes ", projectVersionId, limit);
  if(this.userId){
    let user = Meteor.users.findOne(this.userId),
        limit = limit || 25;
    return RecordChanges.find({projectVersionId: projectVersionId}, {limit: limit, sort:{date: -1}});
  }
  console.warn("Publish: version_changes returning nothing");
  return [];
});

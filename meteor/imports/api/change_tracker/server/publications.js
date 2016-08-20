import {Meteor} from 'meteor/meteor';
import {RecordChanges} from '../record_change.js';

Meteor.publish("changes", function (projectList, limit) {
  console.debug("Publish: changes");
  if(this.userId){
    let user = Meteor.users.findOne(this.userId),
        limit = limit || 25;
    return RecordChanges.find({projectId: {$in: user.projectList || []}}, {limit: limit});
  }
  console.warn("Publish: changes returning nothing");
  return [];
});

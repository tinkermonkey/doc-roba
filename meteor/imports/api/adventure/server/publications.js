import {Meteor} from 'meteor/meteor';

Meteor.publish("", function () {
  console.debug("Publish: ");
  if (this.userId) {
    //return Investigations.find({});
  } else {
    this.ready();
    return [];
  }
});

import {Meteor} from 'meteor/meteor';

Meteor.publish("user_data", function () {
  console.debug("Publish: user_data");
  if(this.userId) {
    return Meteor.users.find({_id: this.userId}, {
      fields: {
        projectList: 1,
        projects: 1, isSystemAdmin: 1
      }
    });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish("user_peers", function (projectList) {
  console.debug("Publish: user_peers");
  var user = Meteor.users.findOne(this.userId);
  if(user && user.projectList && user.projectList.length) {
    console.log("user_peers:", user.projectList);
    return Meteor.users.find({projectList: user.projectList}, {
      fields: {
        profile: 1,
        emails: 1,
        projectList: 1,
        projects: 1
      }
    });
  } else {
    console.error("user_peers fail:", user);
  }
  return []
});


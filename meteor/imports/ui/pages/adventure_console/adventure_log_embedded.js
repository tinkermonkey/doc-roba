import './adventure_log_embedded.html';
import { Template } from 'meteor/templating';
import { LogMessages } from '../../../api/log_message/log_message.js';

/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.helpers({
  messages () {
    var instance  = Template.instance();
    var adventure = this.adventure;
    console.log("AdventureLogEmbedded messages: ", instance.data, adventure);
    return LogMessages.find({
      "context.adventureId": adventure._id
    }, {
      sort : { time: -1 },
      limit: 1000
    });
  }
});

/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.events({});

/**
 * Template Rendered
 */
Template.AdventureLogEmbedded.onCreated(() => {
  let instance = Template.instance;
  
  instance.autorun(function () {
    instance.subscribe("adventure_log", instance.data.adventure._id);
  });
});

/**
 * Template Rendered
 */
Template.AdventureLogEmbedded.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureLogEmbedded.onDestroyed(() => {
  
});

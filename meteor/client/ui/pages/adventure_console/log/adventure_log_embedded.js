import './adventure_log_embedded.html';
import './adventure_log.css';
import { Template } from 'meteor/templating';
import { LogMessages } from '../../../../../imports/api/log_messages/log_messages.js';
import '../../../components/log_messages/log_message_data.js';

/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.helpers({
  messages () {
    var adventure = this.adventure.get();
    
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
  let instance = Template.instance();
  
  instance.autorun(function () {
    let data      = Template.currentData(),
        adventure = data.adventure.get();
    instance.subscribe("adventure_log", adventure.projectId, adventure._id);
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

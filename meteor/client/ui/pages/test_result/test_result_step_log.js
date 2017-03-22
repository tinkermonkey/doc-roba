import './test_result_step_log.html';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { LogMessages } from '../../../../imports/api/log_messages/log_messages.js';
import '../../components/log_messages/log_message_data.js';
import '../../components/editable_fields/editable_log_filters/editable_filter_time.js';
import '../../components/editable_fields/editable_log_filters/editable_filter_option.js';

/**
 * Template Helpers
 */
Template.TestResultStepLog.helpers({
  messages () {
    let filter = Template.instance().filter.get();
    return Template.instance().messages();
  },
  maxLogWidth() {
    return Template.instance().maxLogWidth.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepLog.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    //console.log("Edited:", $(e.target).attr("data-key"), newValue);
    let dataKey = $(e.target).attr("data-key"),
        filter  = instance.filter.get();
    
    filter[ dataKey ] = newValue;
    instance.filter.set(filter);
  }
});

/**
 * Template Created
 */
Template.TestResultStepLog.onCreated(() => {
  let instance         = Template.instance();
  instance.startTime   = Date.now();
  instance.maxLogWidth = new ReactiveVar(parseInt(window.innerWidth / 3));
  instance.filter      = new ReactiveVar({});
  
  // setup the messages data
  instance.messages = function () {
    //return Template.instance().messages().find({"context.adventureId": this._id}, {sort: {time: -1}});
    let step   = Template.currentData(),
        filter = instance.filter.get(),
        query  = step.logMessageQuery();
    
    // setup the query for the time filter
    if (filter.time && (filter.time.start != null || filter.time.end != null)) {
      query.time = {};
      if (filter.time.start != null) {
        query.time[ "$gt" ] = filter.time.start;
      }
      if (filter.time.end != null) {
        query.time[ "$lt" ] = filter.time.end;
      }
    }
    
    // setup the query for the level and sender filters
    if (filter.level && filter.level.length) {
      query.level = { $in: filter.level }
    }
    if (filter.sender && filter.sender.length) {
      query.sender = { $in: filter.sender }
    }
    
    //console.log("TestResultStepLog autorun filter and query:", filter, query);
    return LogMessages.find(query, {
      sort : { time: 1 }
    });
  };
});

/**
 * Template Rendered
 */
Template.TestResultStepLog.onRendered(() => {
  let instance = Template.instance();
  console.log("TestResultStepLog.rendered: ", Date.now() - instance.startTime);
  instance.autorun(function () {
    let resize       = Session.get("resize"),
        pageWidth    = instance.$(".center-pole-content").width(),
        contentWidth = instance.$(".roba-round-container-body").width();
    if (resize.width) {
      instance.maxLogWidth.set(parseInt(contentWidth));
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestResultStepLog.onDestroyed(() => {
  
});

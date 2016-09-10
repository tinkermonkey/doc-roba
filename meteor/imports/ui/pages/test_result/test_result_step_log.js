import './test_result_step_log.html';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../../components/log_messages/log_message_data.js';

/**
 * Template Helpers
 */
Template.TestResultStepLog.helpers({
  maxLogWidth() {
    return Template.instance().maxLogWidth.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepLog.events({});

/**
 * Template Created
 */
Template.TestResultStepLog.onCreated(() => {
  let instance         = Template.instance();
  instance.startTime   = Date.now();
  instance.maxLogWidth = new ReactiveVar(parseInt(window.innerWidth / 3));
});

/**
 * Template Rendered
 */
Template.TestResultStepLog.onRendered(() => {
  console.log("TestResultStepLog.rendered: ", Date.now() - this.startTime);
  let instance = Template.instance();
  instance.autorun(function () {
    var resize = Session.get("resize");
    if (resize.width) {
      instance.maxLogWidth.set(parseInt(resize.width / 3));
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestResultStepLog.onDestroyed(() => {
  
});

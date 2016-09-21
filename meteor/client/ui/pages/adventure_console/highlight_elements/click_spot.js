import './click_spot.html';
import './click_spot.css';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

/**
 * Template Helpers
 */
Template.ClickSpot.helpers({
  loaded () {
    return Template.instance().loaded.get();
  }
});

/**
 * Template Event Handlers
 */
Template.ClickSpot.events({});

/**
 * Template Created
 */
Template.ClickSpot.onCreated(() => {
  let instance    = Template.instance();
  instance.loaded = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.ClickSpot.onRendered(() => {
  let instance = Template.instance();
  setTimeout(() => {
    instance.loaded.set(true);
  }, 100);
});

/**
 * Template Destroyed
 */
Template.ClickSpot.onDestroyed(() => {
  
});

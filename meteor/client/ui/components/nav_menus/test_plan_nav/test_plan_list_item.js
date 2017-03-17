import './test_plan_list_item.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.TestPlanListItem.helpers({});

/**
 * Template Event Handlers
 */
Template.TestPlanListItem.events({});

/**
 * Template Created
 */
Template.TestPlanListItem.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.TestPlanListItem.onRendered(()=> {
  var instance = Template.instance();
  
  // make this draggable
  instance.$(".center-pole-list-selectable").draggable({
    revert  : true,
    distance: 5,
    start(event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop(event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestPlanListItem.onDestroyed(() => {
  
});

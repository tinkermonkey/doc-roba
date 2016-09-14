import './adventure_status_bar.html';

import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdventureStatusBar.helpers({
  getHeaderMargin(){
    return Template.instance().headerMargin.get();
  },
  adventureStatus(){
    return this.adventure.get().status
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureStatusBar.events({});

/**
 * Template Created
 */
Template.AdventureStatusBar.onCreated(() => {
  let instance          = Template.instance();
  instance.headerMargin = new ReactiveVar();
});

/**
 * Template Rendered
 */
Template.AdventureStatusBar.onRendered(() => {
  let instance = Template.instance();
  instance.autorun(() => {
    let viewport = instance.data.viewport.get(),
        header = instance.$(".adventure-status-header"),
        offset = $(".roba-accordion-content").first().offset(),
        currentMargin = parseInt(header.css("margin-top"));
    
    if(currentMargin >= 0 && viewport && viewport.offset){
      instance.headerMargin.set(currentMargin + viewport.offset.top - offset.top);
    }
  })
});

/**
 * Template Destroyed
 */
Template.AdventureStatusBar.onDestroyed(() => {
  
});

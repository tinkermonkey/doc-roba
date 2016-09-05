import './action_snippet.html';

import {Template} from 'meteor/templating';

import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';

/**
 * Template Helpers
 */
Template.ActionSnippet.helpers({
  actionX () {
    return DocTreeConfig.nodes.width / 2
  },
  actionY () {
    return DocTreeConfig.nodes.yMargin - DocTreeConfig.actions.tipCompensation
  },
  labelY () {
    let height = Template.instance().labelBackHeight.get();
    return DocTreeConfig.nodes.yMargin / 2 - (height / 2) * 1.5;
  },
  labelBackY () {
    let height = Template.instance().labelBackHeight.get();
    return DocTreeConfig.nodes.yMargin / 2 - (height / 2) * 1.5 - DocTreeConfig.nodes.borderWidth;
  },
  labelBackX () {
    let width = Template.instance().labelBackWidth.get();
    return (DocTreeConfig.nodes.width / 2) - (width / 2);
  },
  labelBackWidth () {
    return Template.instance().labelBackWidth.get();
  },
  labelBackHeight () {
    let height = Template.instance().labelBackHeight.get();
    return height + 2 * DocTreeConfig.nodes.borderWidth;
  },
  labelBackBorderRadius () {
    return DocTreeConfig.nodes.cornerRadius / 2;
  }
});

/**
 * Template Event Handlers
 */
Template.ActionSnippet.events({});

/**
 * Template Created
 */
Template.ActionSnippet.onCreated(() => {
  let self = Template.instance();
  self.labelBackWidth = new ReactiveVar(DocTreeConfig.nodes.width);
  self.labelBackHeight = new ReactiveVar(DocTreeConfig.nodes.height);
});

/**
 * Template Rendered
 */
Template.ActionSnippet.onRendered(() => {
  let self = Template.instance();
  
  // auto-compute the width after render and if the label text changes
  self.autorun(() => {
    let data = Template.currentData(),
        dummyTextEl = self.$(".dummy-label-text").get(0),
        width = dummyTextEl.getComputedTextLength(),
        bbox = dummyTextEl.getBBox();
    if(width){
      self.labelBackWidth.set(width + DocTreeConfig.nodes.borderWidth * 2);
    }
    if(bbox && bbox.height){
      self.labelBackHeight.set(bbox.height);
    }
  });
});

/**
 * Template Destroyed
 */
Template.ActionSnippet.onDestroyed( () => {
  
});

import './node_snippet.html';

import {Template} from 'meteor/templating';

import {DocTreeConfig} from '../../lib/doc_tree_config.js';
import {NodeTypes} from '../../../api/node/node_types.js';
import {Util} from '../../../api/util.js';

/**
 * Template Helpers
 */
Template.NodeSnippet.helpers({
  getNodeClass: function () {
    switch(this.type){
      case NodeTypes.view:
        return "node-view";
      case NodeTypes.navMenu:
        return "node-navMenu";
      default:
        return "node-page"
    }
  },
  titleX: function () {
    return DocTreeConfig.nodes.width / 2;
  },
  titleY: function () {
    return DocTreeConfig.nodes.titleHeight + DocTreeConfig.nodes.borderWidth;
  }
});

/**
 * Template Helpers
 */
Template.NodeSnippet.events({});

/**
 * Template Created
 */
Template.NodeSnippet.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.NodeSnippet.onRendered(() => {
  let self = Template.instance();
  
  self.autorun(() => {
    let data = Template.currentData();

    d3.select("#" + self.elementId)
        .selectAll("text.node-title")
        .call(Util.wrapSvgText, DocTreeConfig.nodes.width - 2 * DocTreeConfig.nodes.borderWidth);
  });
});

/**
 * Template Destroyed
 */
Template.NodeSnippet.onDestroyed(() => {

});

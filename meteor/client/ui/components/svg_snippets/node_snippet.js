import './node_snippet.html';
import { Template } from 'meteor/templating';
import { DocTreeConfig } from '../../lib/doc_tree/doc_tree_config.js';
import { NodeTypes } from '../../../../imports/api/node/node_types.js';
import { Util } from '../../../../imports/api/util.js';

/**
 * Template Helpers
 */
Template.NodeSnippet.helpers({
  getNodeClass() {
    switch (this.type) {
      case NodeTypes.view:
        return "node-view";
      case NodeTypes.navMenu:
        return "node-navMenu";
      default:
        return "node-page"
    }
  },
  titleX() {
    return DocTreeConfig.nodes.width / 2;
  },
  titleY() {
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
  let instance = Template.instance();
  
  instance.autorun(() => {
    let data = Template.currentData();
    
    setTimeout(() => {
      d3.select("#" + instance.elementId)
          .selectAll("text.node-title")
          .call(Util.wrapSvgText, DocTreeConfig.nodes.width - 2 * DocTreeConfig.nodes.borderWidth);
    }, 100);
  });
});

/**
 * Template Destroyed
 */
Template.NodeSnippet.onDestroyed(() => {
  
});

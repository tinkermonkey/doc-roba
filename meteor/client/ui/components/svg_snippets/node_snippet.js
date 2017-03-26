import './node_snippet.html';
import { Template } from 'meteor/templating';
import { DocTreeConfig } from '../../lib/doc_tree/doc_tree_config.js';
import { NodeTypes } from '../../../../imports/api/nodes/node_types.js';
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
    let data           = Template.currentData(),
        titleContainer = d3.select("#" + instance.elementId).select(".node-title-container");
    
    if(data && data.title){
      // Remove any existing node title
      titleContainer.select('text').remove();
  
      // Set the node title
      titleContainer.append('text')
          .attr('class', 'node-title pre-render no-select-complete')
          .attr('x', DocTreeConfig.nodes.width / 2)
          .attr('y', DocTreeConfig.nodes.titleHeight + DocTreeConfig.nodes.borderWidth)
          .text(data.title)
          .call(Util.wrapSvgText, DocTreeConfig.nodes.width - 2 * DocTreeConfig.nodes.borderWidth)
          .classed('pre-render', false);
    }
  });
});

/**
 * Template Destroyed
 */
Template.NodeSnippet.onDestroyed(() => {
  
});

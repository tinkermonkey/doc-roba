import './node_url_search_results.html';
import './node_search.css';

import {Template} from 'meteor/templating';

import '../svg_snippets/standalone_node_snippet.js';

/**
 * Template Helpers
 */
Template.NodeUrlSearchResults.helpers({});

/**
 * Template Event Handlers
 */
Template.NodeUrlSearchResults.events({
  "click .node-search-icon"(e, instance){
    let context = Template.parentData(1),
        nodeId = $(e.target).closest(".node-search-icon").attr("data-node-staticId");
    console.log("NodeUrlSearchResults click:", nodeId, context);
    if(context && context.currentNodeId && nodeId){
      console.log("NodeUrlSearchResults setting current no to", nodeId);
      context.currentNodeId.set(nodeId);
    }
  }
});

/**
 * Template Created
 */
Template.NodeUrlSearchResults.created = function () {

};

/**
 * Template Rendered
 */
Template.NodeUrlSearchResults.rendered = function () {
  var instance = Template.instance();

  // node search result explanations
  instance.$(".node-search-result").popover({
    placement: 'top',
    trigger: 'hover',
    html: true,
    delay: 100
  });

  // node click to designate as current node
  instance.$(".node-search-icon").popover({
    placement: 'left',
    trigger: 'hover',
    html: true,
    delay: 500
  });
};

/**
 * Template Destroyed
 */
Template.NodeUrlSearchResults.destroyed = function () {

};

import './node_snippet.html';

import {Template} from 'meteor/templating';

import {DocTreeConfig} from '../../lib/doc_tree_config.js';
import {NodeTypes} from '../../../api/node/node_types.js';

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
  titleY: function () {
    return DocTreeConfig.nodes.titleHeight + DocTreeConfig.nodes.borderWidth;
  }
});

/**
 * Template Helpers
 */
Template.NodeSnippet.events({});

/**
 * Template Rendered
 */
Template.NodeSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.NodeSnippet.destroyed = function () {

};

import './standalone_node_snippet.html';

import {Template} from 'meteor/templating';

import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';
import './node_snippet.js';

/**
 * Template Helpers
 */
Template.StandaloneNodeSnippet.helpers({
  width() {
    return DocTreeConfig.nodes.width * (this.scale || 1) + DocTreeConfig.standalone.margin * 2;
  },
  height() {
    return DocTreeConfig.nodes.height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2;
  },
  margin() {
    return DocTreeConfig.standalone.margin;
  },
  getScale() {
    return this.scale || 1;
  }
});

/**
 * Template Helpers
 */
Template.StandaloneNodeSnippet.events({});

/**
 * Template Rendered
 */
Template.StandaloneNodeSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.StandaloneNodeSnippet.destroyed = function () {

};

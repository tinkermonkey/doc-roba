import './single_route_snippet.html';

import {Template} from 'meteor/templating';

import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';
import {PathBuilder} from '../../lib/doc_tree/path_builder.js';

/**
 * Template Helpers
 */
Template.SingleRouteSnippet.helpers({
  width() {
    return DocTreeConfig.nodes.width * 3 + DocTreeConfig.standalone.margin * 2;
  },
  height() {
    return DocTreeConfig.nodes.height + DocTreeConfig.standalone.margin * 2;
  },
  scale() {
    return this.scale || 1;
  },
  xMargin() {
    return DocTreeConfig.standalone.margin;
  },
  yMargin() {
    return DocTreeConfig.standalone.margin;
  },
  routeNodeX() {
    return DocTreeConfig.nodes.width * 2;
  },
  path(action) {
    var startY  = DocTreeConfig.nodes.height / 2,
      startX  = DocTreeConfig.nodes.width + 2,
      endX    = DocTreeConfig.nodes.width * 2 - 6;

    return PathBuilder.start()
      .M(startX, startY)
      .L(endX, startY)
      .compile();
  }
});

/**
 * Template Helpers
 */
Template.SingleRouteSnippet.events({});

/**
 * Template Rendered
 */
Template.SingleRouteSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.SingleRouteSnippet.destroyed = function () {

};

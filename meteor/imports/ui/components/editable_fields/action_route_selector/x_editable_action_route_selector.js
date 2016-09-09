import './x_editable_action_route_selector.html';

import {Template} from 'meteor/templating';

import {Actions} from '../../../../api/action/action.js';
import '../../svg_snippets/action_route_snippet.js';
import '../../svg_snippets/single_route_snippet.js';

/**
 * Template Helpers
 */
Template.XEditableActionRouteSelector.helpers({
  getValue: function () {
    return Template.instance().value.get();
  },
  actions: function () {
    var filter = Template.instance().filter.get();
    if(this.staticId && this.projectVersionId){
      if(filter && filter.length > 1){
        return Actions.find({nodeId: this.staticId, projectVersionId: this.projectVersionId, title: {$regex: filter, $options: "i"}}, {sort: {title: 1}});
      } else {
        return Actions.find({nodeId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {title: 1}});
      }
    }
  },
  actionWithScale: function () {
    this.scale = 1.0;
    return this;
  }
});

/**
 * Template Event Handlers
 */
Template.XEditableActionRouteSelector.events({
  "keyup .input-search, change .input-search": function (e, instance) {
    var filter = $(e.target).val();
    instance.filter.set(filter);
  },
  "click .route-destination": function (e, instance) {
    var route = this,
      destination = $(e.target).closest(".route-destination"),
      actionId = destination.attr("data-action-id"),
      nodeId = destination.attr("data-node-id");

    if(actionId && nodeId){
      instance.value.set({
        actionId: actionId,
        nodeId: nodeId
      });
      instance.data.xEditable.$input.filter("[name='actionId']").val(actionId);
      instance.data.xEditable.$input.filter("[name='nodeId']").val(nodeId);
    }
  }
});

/**
 * Template Created
 */
Template.XEditableActionRouteSelector.created = function () {
  let instance = Template.instance();
  instance.value = new ReactiveVar();
  instance.filter = new ReactiveVar();
};

/**
 * Template Rendered
 */
Template.XEditableActionRouteSelector.rendered = function () {
  var instance = this,
    actionId = instance.data.xEditable.$input.filter("[name='actionId']").val(),
    nodeId = instance.data.xEditable.$input.filter("[name='nodeId']").val();
  instance.value.set({
    actionId: actionId,
    nodeId: nodeId
  });

  setTimeout(function () {
    instance.$(".input-search").focus();
  }, 500);
};

/**
 * Template Destroyed
 */
Template.XEditableActionRouteSelector.destroyed = function () {
  
};

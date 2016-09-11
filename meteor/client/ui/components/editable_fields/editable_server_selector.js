import './editable_server_selector.html';

import {Template} from 'meteor/templating';

import {TestServers} from '../../../../imports/api/test_server/test_server.js';

/**
 * Template Helpers
 */
Template.EditableServerSelector.helpers({});

/**
 * Template Helpers
 */
Template.EditableServerSelector.events({});

/**
 * Template Rendered
 */
Template.EditableServerSelector.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      servers = TestServers.find({
        projectVersionId: instance.data.projectVersionId,
        active: true
      }, {sort: {title: 1}}).map(function (server) {
        return { value: server.staticId, text: server.title };
      });

    instance.$('.editable-server-selector').editable({
      mode: instance.data.mode || "inline",
      type: "select",
      source: servers,
      highlight: false,
      display() {},
      success(response, newValue) {
        var editedElement = this;
        $(editedElement).trigger("edited", [newValue]);
        setTimeout(function () {
          $(editedElement).removeClass('editable-unsaved');
        }, 10);
      }
    });
    instance.$('.editable-server-selector').editable("option", "source", servers);
    instance.$('.editable-server-selector').editable("setValue", data.value, true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableServerSelector.destroyed = function () {

};

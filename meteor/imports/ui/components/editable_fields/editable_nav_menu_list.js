import './editable_nav_menu_list.html';

import {Template} from 'meteor/templating';

import {Nodes} from '../../../api/node/node.js';
import {NodeTypes} from '../../../api/node/node_types.js';

/**
 * Template Helpers
 */
Template.EditableNavMenuList.helpers({
  valueList() {
    return this.value ? this.value.join(",") : ''
  }
});

/**
 * Template Helpers
 */
Template.EditableNavMenuList.events({});

/**
 * Template Rendered
 */
Template.EditableNavMenuList.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var data = Template.currentData(),
      query = { type: NodeTypes.navMenu, projectVersionId: instance.data.projectVersionId };

    // TODO: this needs to be restricted to a platform/user domain
    var navMenus = Nodes.find(query, {sort: {title: 1}}).map(function (nav) {
        return { value: nav.staticId, text: nav.title };
      });

    instance.$('.editable-nav-menu-list').editable({
      mode: data.mode || "inline",
      type: "checklist",
      source: navMenus,
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
    instance.$('.editable-nav-menu-list').editable("option", "source", navMenus);
    instance.$('.editable-nav-menu-list').editable("setValue", data.value ? data.value.join(",") : '', true);
  });
};

/**
 * Template Destroyed
 */
Template.EditableNavMenuList.destroyed = function () {

};

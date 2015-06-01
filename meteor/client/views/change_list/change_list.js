/**
 * Template Helpers
 */
Template.change_list.helpers({
  changeTemplate: function () {
    var defaultTemplate = Template.default_change;
    //console.log("changeTemplate: ", this.collection);
    return Template[this.collection + "_change"] ? Template[this.collection + "_change"] : defaultTemplate;
  }
});

/**
 * Template Helpers
 */
Template.change_list.events({});

/**
 * Template Rendered
 */
Template.change_list.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.change_list.destroyed = function () {

};

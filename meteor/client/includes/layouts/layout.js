/**
 * Template Helpers
 */
Template.layout.helpers({});

/**
 * Template Helpers
 */
Template.layout.events({});

/**
 * Template Rendered
 */
Template.layout.rendered = function () {
  this.find('#page')._uihooks = {
    insertElement: function(node, next) {
      console.log("Insert element");
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      console.log("Remove Element");
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  }
};

/**
 * Template Destroyed
 */
Template.layout.destroyed = function () {

};

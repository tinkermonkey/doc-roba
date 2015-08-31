/**
 * Template Helpers
 */
Template.layout.helpers({});

/**
 * Template Event Handlers
 */
Template.layout.events({});

/**
 * Template Created
 */
Template.layout.created = function () {
  
};

/**
 * Template Rendered
 */
Template.layout.rendered = function () {
  this.find('#page')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .show();
    },
    removeElement: function(node) {
      $(".auto-slide-right").addClass("intro-slide-right");
      $(".auto-slide-left").addClass("intro-slide-left");
      $(node)
        .delay(2000)
        .remove();
    }
  }
};

/**
 * Template Destroyed
 */
Template.layout.destroyed = function () {
  
};

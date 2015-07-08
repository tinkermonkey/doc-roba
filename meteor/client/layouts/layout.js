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
        .fadeIn(function () {
          $(".auto-slide-right").removeClass("intro-slide-right");
          $(".auto-slide-left").removeClass("intro-slide-left");
        });
    },
    removeElement: function(node) {
      $(".auto-slide-right").addClass("intro-slide-right");
      $(".auto-slide-left").addClass("intro-slide-left");
      setTimeout(function () {
        $(node).remove();
      }, 500);
    }
  }
};

/**
 * Template Destroyed
 */
Template.layout.destroyed = function () {
  
};

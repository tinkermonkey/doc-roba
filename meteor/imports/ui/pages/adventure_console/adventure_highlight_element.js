/**
 * Template helpers
 */
Template.AdventureHighlightElement.helpers({
});

/**
 * Event Handlers
 */
Template.AdventureHighlightElement.events({
  "click .adventure-highlight-element": function (e) {
    var instance = Template.instance(),
      element = $(e.target),
      detail = $("#adventure-highlight-detail-" + instance.data.index);

    if(element.hasClass("active")){
      element.removeClass("active");
      detail.removeClass("active");
    } else {
      // clear the currently active
      $(".adventure-highlight-element.active").removeClass("active");
      $(".adventure-highlight-detail.active").removeClass("active");
      element.addClass("active");
      detail.addClass("active");
    }
  }
});

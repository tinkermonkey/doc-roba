/**
 * Simple system for accordion elements
 */
Accordion = {
  init: function (instance) {
    // Setup the tab event listeners
    instance.$(".accordion-heading").click(function (e) {
      var content = $(e.target).next(".accordion-inner");
      content.stop().slideToggle(200);

      if(!content.hasClass("accordion-sticky")){
        $(e.target)
          .closest(".accordion")
          .find("> .accordion-group > .accordion-content > .accordion-inner:not(.accordion-sticky)")
          .filter(function (i, el) {
            return el !== content.get(0);
          })
          .slideUp(200);
      }
    });

    return this;
  },
  activate: function (name) {
    var inner = $(".accordion-group[data-accordion-name='" + name + "'] .accordion-inner");
    if(!inner.is(":visible")){
      $(".accordion-group[data-accordion-name='" + name + "'] .accordion-heading").first().trigger("click");
    }
  }
};
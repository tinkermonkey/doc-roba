/**
 * Template Helpers
 */
Template.not_found.helpers({});

/**
 * Template Helpers
 */
Template.not_found.events({});

/**
 * Template Rendered
 */
Template.not_found.rendered = function () {
  d3.selectAll(".hide:not(.login-spinner)").classed("hide", false);
  d3.selectAll("#login-intro-animation,#login-intro-mask-animation")
    .each(function () {
      this.beginElement();
    });
};

/**
 * Template Destroyed
 */
Template.not_found.destroyed = function () {

};

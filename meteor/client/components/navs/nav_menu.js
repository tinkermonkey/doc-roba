/**
 * Template helpers
 */
Template.nav_menu.helpers({
  navTitle: function () {
    return Session.get("navTitle")
  }
});

/**
 * Template rendered
 */
Template.nav_menu.rendered = function () {
  var instance = Template.instance();

  if(!instance._init){
    instance._init = true;

    // setup the nav menu controller
    instance.$(".nav-logo-bar")
      .on("mouseenter", function () {
        $(".main-nav-placement")
          .css("height", parseInt($(".nav-body").outerHeight()) + "px")
          .css("right", "0px");
        $(".nav-body").addClass("nav-body-show");
      });
    instance.$(".nav-body")
      .on("mouseleave", function () {
        $(".main-nav-placement")
          .css("height", "")
          .css("right", "");
        $(".nav-body").removeClass("nav-body-show");
      });
  }
};

/**
 * Template Helpers
 */
Template.drawer_bottom.helpers({});

/**
 * Template Helpers
 */
Template.drawer_bottom.events({
  "click .expander": function (e) {
    //console.log("Expand!");
    var instance = Template.instance();

    instance.$(".drawer-bottom").animate({
      height: window.innerHeight - 140 // keep it below the main navigation menu
    }, instance.data.slideTime, function () {
      instance.$(".expander").css("display", "none");
      instance.$(".contractor").css("display", "");

      // set the expanded flag
      Session.set("drawerExpanded", true);
    });
  },
  "click .contractor": function (e) {
    //console.log("Contract!");
    var instance = Template.instance();

    instance.$(".drawer-bottom").animate({
      height: instance.data.height
    }, instance.data.slideTime, function () {
      instance.$(".contractor").css("display", "none");
      instance.$(".expander").css("display", "");

      // set the expanded flag
      Session.set("drawerExpanded", false);
    });
  },
  "click .closer": function (e) {
    //console.log("Close!");
    BottomDrawer.hide();
  }
});

/**
 * Template Rendered
 */
Template.drawer_bottom.rendered = function () {
  var instance = BottomDrawer.currentInstance = Template.instance();

  // Slide the drawer open
  $(".drawer-bottom")
    .css("display", "block")
    .animate({
      height: instance.data.height
    }, instance.data.slideTime, function(){
      Session.set("drawerVisible", true);
    });
};

/**
 * Template Destroyed
 */
Template.drawer_bottom.destroyed = function () {
  Session.set("drawerVisible", false);
};

/**
 * Singleton class for controlling the drawer globally
 * @type {{}}
 */
BottomDrawer = {
  show: function(options){
    //console.log("BottomDrawer.show: ", options);

    // Combine the options with the defaults
    _.defaults(options, {
      height: 250,
      slideTime: 125,
      callback: function () {
        console.log("Drawer Closed: ", this);
      }.bind(this)
    });

    // hide the drawer if it's shown
    if($(".drawer-bottom").get(0)){
      // Slide the drawer open
      $(".drawer-bottom")
        .animate({
          height: 0
        }, options.slideTime / 2, function(){
          BottomDrawer.hide(function (){
            Session.set("drawerExpanded", false);
            Blaze.renderWithData(Template.drawer_bottom, options, $("body")[0]);
          });
        });
    } else {
      Session.set("drawerExpanded", false);
      Blaze.renderWithData(Template.drawer_bottom, options, $("body")[0]);
    }
  },
  hide: function (callback) {
    console.log("BottomDrawer.hide");
    if(BottomDrawer.currentInstance){
      // Fade out and destroy the template
      BottomDrawer.currentInstance.$(".drawer-bottom")
        .animate({
          height: 0
        }, BottomDrawer.currentInstance.data.slideTime / 2, function(){
          Blaze.remove(BottomDrawer.currentInstance.view);

          if(callback){
            callback();
          }

          if(BottomDrawer.currentInstance && BottomDrawer.currentInstance.data.callback){
            BottomDrawer.currentInstance.data.callback();
          }

          delete BottomDrawer.currentInstance;
        });
    }
  }
};
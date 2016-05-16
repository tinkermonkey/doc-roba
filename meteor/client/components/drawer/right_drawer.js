/**
 * Template Helpers
 */
Template.RightDrawer.helpers({});

/**
 * Template Helpers
 */
Template.RightDrawer.events({
  "click .closer": function (e) {
    //console.log("Close!");
    RightDrawer.hide();
  }
});

/**
 * Template Rendered
 */
Template.RightDrawer.rendered = function () {
  var instance = RightDrawer.currentInstance = Template.instance();

  // Slide the drawer open
  $(".right-drawer")
    .css("display", "block")
    .animate({
      width: instance.data.width
    }, instance.data.slideTime, function(){
      Session.set("drawerVisible", true);
    });
};

/**
 * Template Destroyed
 */
Template.RightDrawer.destroyed = function () {
  Session.set("drawerVisible", false);
};

/**
 * Singleton class for controlling the drawer globally
 * @type {{}}
 */
RightDrawer = {
  show: function(options){
    //console.log("RightDrawer.show: ", options);

    // Combine the options with the defaults
    _.defaults(options, {
      width: "33.33%",
      slideTime: 125,
      callback: function () {
        console.log("Drawer Closed: ", this);
      }.bind(this)
    });

    // hide the drawer if it's shown
    if($(".right-drawer").get(0)){
      // Slide the drawer open
      $(".right-drawer")
        .animate({
          width: 0
        }, options.slideTime / 2, function(){
          RightDrawer.hide(function (){
            Blaze.renderWithData(Template.RightDrawer, options, $("body")[0]);
          });
        });
    } else {
      Blaze.renderWithData(Template.RightDrawer, options, $("body")[0]);
    }
  },
  hide: function (callback) {
    console.log("RightDrawer.hide");
    if(RightDrawer.currentInstance){
      // Fade out and destroy the template
      RightDrawer.currentInstance.$(".right-drawer")
        .animate({
          width: 0
        }, RightDrawer.currentInstance.data.slideTime / 2, function(){
          Blaze.remove(RightDrawer.currentInstance.view);

          if(callback){
            callback();
          }

          if(RightDrawer.currentInstance && RightDrawer.currentInstance.data.callback){
            RightDrawer.currentInstance.data.callback();
          }

          delete RightDrawer.currentInstance;
        });
    }
  }
};
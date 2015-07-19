/**
 * Template Helpers
 */
Template.Home.helpers({
  isActiveDashboard: function () {
    var currentRoute = Router.current();
    return !(currentRoute.params._id || currentRoute.params.projectId)
  },
  isActiveProject: function () {
    var currentRoute = Router.current(),
      project = this;

    if(project._id && currentRoute.params._id || currentRoute.params.projectId){
      return project._id === currentRoute.params._id;
      //return project._id === currentRoute.params._id || project._id === currentRoute.params.projectId;
    }
  },
  isActiveVersion: function () {
    var currentRoute = Router.current(),
      version = this;

    if(version._id && currentRoute.params._id){
      return version._id === currentRoute.params._id;
    }
  }
});

/**
 * Event Handlers
 */
Template.Home.events({

});

/**
 * Template Rendered
 */
Template.Home.rendered = function(){
  setTimeout(function () {
    console.log("insertElement code fires");
    $(".auto-slide-right").removeClass("intro-slide-right");
    $(".auto-slide-left").removeClass("intro-slide-left");
  }, 500);

  // Wire in the tabs
  Tabs.init(Template.instance());
};

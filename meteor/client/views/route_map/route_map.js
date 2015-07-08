/**
 * Template Helpers
 */
Template.RouteMap.helpers({});

/**
 * Template Event Handlers
 */
Template.RouteMap.events({});

/**
 * Template Created
 */
Template.RouteMap.created = function () {
  
};

/**
 * Template Rendered
 */
Template.RouteMap.rendered = function () {
  var instance = this;

  if(!instance.init){
    instance.init = true;

    // Setup the view only once
    instance.routeLayout = new RouteLayout(instance._elementId, instance.data);
    instance.routeLayout.init();

    // for the data binding we just need to setup an update call
    instance.autorun(function () {
      Meteor.log.debug("Auto-run executing route_layout: ");

      // get the nodes and actions
      var data = Template.currentData();

      // update the nodes & actions
      instance.routeLayout.setRoute(data.route);

      // set up the base
      instance.routeLayout.update();
    });

    // respond to window resize events
    instance.autorun(function () {
      var resize = Session.get("resize");
      instance.routeLayout.resize();
    });
  }
};

/**
 * Template Destroyed
 */
Template.RouteMap.destroyed = function () {
  
};

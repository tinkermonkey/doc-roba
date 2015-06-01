/**
 *
 * Created by austin sand on 1/4/15
 *
 */

/**
 * Template Helpers
 */
Template.version_credentials_config.helpers({});

/**
 * Template Helpers
 */
Template.version_credentials_config.events({});

/**
 * Template Rendered
 */
Template.version_credentials_config.rendered = function () {
  var instance = Template.instance();

  // Initialize the tabs
  Tabs.init(instance).activateFirst(instance);
};

/**
 * Template Destroyed
 */
Template.version_credentials_config.destroyed = function () {

};

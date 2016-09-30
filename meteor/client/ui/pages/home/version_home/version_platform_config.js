import './version_platform_config.html';
import { Template } from 'meteor/templating';
import { Util } from '../../../../../imports/api/util.js';

/**
 * Template Helpers
 */
Template.VersionPlatformConfig.helpers({
  platformTitleClean(){
    return Util.dataKey(this.userType().title + this.title);
  },
  platformTitle(){
    return this.userType().title + ' - ' + this.title;
  }
});

/**
 * Template Event Handlers
 */
Template.VersionPlatformConfig.events({});

/**
 * Template Created
 */
Template.VersionPlatformConfig.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.VersionPlatformConfig.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.VersionPlatformConfig.onDestroyed(() => {
  
});

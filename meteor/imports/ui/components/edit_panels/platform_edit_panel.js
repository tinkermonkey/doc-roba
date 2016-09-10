import './platform_edit_panel.html';

import {Template} from 'meteor/templating';

import {PlatformTypes} from '../../../api/node/platform_types.js';

/**
 * Template Helpers
 */
Template.PlatformEditPanel.helpers({
  getPlatformSchema() {
    console.log("getPlatformSchema: ", this);
    switch(parseInt(this.config.type)) {
      case PlatformTypes.web:
        console.log("getPlatformSchema: ", Schemas.WebPlatformConfig);
        return Schemas.WebPlatformConfig;
      case PlatformTypes.mobileApp:
        console.log("getPlatformSchema: ", Schemas.MobileAppPlatformConfig);
        return Schemas.MobileAppPlatformConfig;
      case PlatformTypes.mobileWeb:
        console.log("getPlatformSchema: ", Schemas.MobileWebPlatformConfig);
        return Schemas.MobileWebPlatformConfig;
      case PlatformTypes.email:
        console.log("getPlatformSchema: ", Schemas.EmailPlatformConfig);
        return Schemas.EmailPlatformConfig;
    }
  }
});

/**
 * Template Helpers
 */
Template.PlatformEditPanel.events({});

/**
 * Template Rendered
 */
Template.PlatformEditPanel.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.PlatformEditPanel.destroyed = function () {

};

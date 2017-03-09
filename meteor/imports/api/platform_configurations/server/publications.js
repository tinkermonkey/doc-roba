import { Meteor } from 'meteor/meteor';
import { Auth } from '../../auth.js';
import { PlatformConfigurations } from '../platform_configurations.js';
import { PlatformOperatingSystems } from '../platform_operating_systems.js';
import { PlatformViewports } from '../platform_viewports.js';

Meteor.publish("platform_configurations", function (projectId, projectVersionId) {
  console.debug("Publish: platform_configurations", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return PlatformConfigurations.find({ projectVersionId: projectVersionId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish("platform_operating_systems", function (projectId, projectVersionId) {
  console.debug("Publish: platform_operating_systems", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return PlatformOperatingSystems.find({ projectVersionId: projectVersionId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish("platform_viewports", function (projectId, projectVersionId) {
  console.debug("Publish: platform_viewports", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return PlatformViewports.find({ projectVersionId: projectVersionId });
  } else {
    this.ready();
    return [];
  }
});

import './platform_viewports.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { PlatformConfigurations } from '../../../../../../imports/api/platform_configurations/platform_configurations.js';
import { PlatformViewports } from '../../../../../../imports/api/platform_configurations/platform_viewports.js';
import '../../../../components/editable_fields/editable_radio_button.js';

/**
 * Template Helpers
 */
Template.PlatformViewports.helpers({});

/**
 * Template Event Handlers
 */
Template.PlatformViewports.events({
  "edited .editable"(e, instance, newValue){
    let target             = $(e.target),
        dataKey            = target.attr("data-key"),
        viewportId         = target.closest(".sortable-table-row").attr("data-pk"),
        update             = { $set: {} };
    update.$set[ dataKey ] = newValue;
    PlatformViewports.update({ _id: viewportId }, update, (error) => {
      if (error) {
        RobaDialog.error("Updating Viewport failed: " + error);
      }
    });
  },
  "click .btn-delete"(e, instance){
    let viewportId = $(e.target).closest(".sortable-table-row").attr("data-pk");
    RobaDialog.ask("Delete Viewport?", "Are you sure that you want to delete this viewport record from this platform?", () => {
      PlatformViewports.remove(viewportId, function (error, response) {
        RobaDialog.hide();
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        }
      });
    });
  },
  "click .btn-add-viewport"(e, instance){
    let platformId = $(e.target).closest(".btn-add-viewport").attr("data-pk");
    if (platformId) {
      let platformConfig = PlatformConfigurations.findOne(platformId);
      PlatformViewports.insert({
        projectId       : platformConfig.projectId,
        projectVersionId: platformConfig.projectVersionId,
        platformId      : platformId,
        title           : 'New Viewport'
      }, function (error, response) {
        if (error) {
          RobaDialog.error("Adding viewport failed: " + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.PlatformViewports.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.PlatformViewports.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.PlatformViewports.onDestroyed(() => {
  
});

import './platform_operating_systems.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { PlatformConfigurations } from '../../../../../../imports/api/platform_configuration/platform_configuration.js';
import { PlatformOperatingSystems } from '../../../../../../imports/api/platform_configuration/platform_operating_system.js';
import '../../../../components/editable_fields/editable_icon_selector/editable_icon_selector.js';

/**
 * Template Helpers
 */
Template.PlatformOperatingSystems.helpers({});

/**
 * Template Event Handlers
 */
Template.PlatformOperatingSystems.events({
  "edited .editable"(e, instance, newValue){
    let target             = $(e.target),
        dataKey            = target.attr("data-key"),
        osId               = target.closest(".sortable-table-row").attr("data-pk"),
        update             = { $set: {} };
    update.$set[ dataKey ] = newValue;
    PlatformOperatingSystems.update({ _id: osId }, update, (error) => {
      if (error) {
        RobaDialog.error("Updating Operating System failed: " + error);
      }
    });
  },
  "click .btn-delete"(e, instance){
    let osId = $(e.target).closest(".sortable-table-row").attr("data-pk");
    RobaDialog.ask("Delete Operating System?", "Are you sure that you want to delete this OS record from this platform?", () => {
          PlatformOperatingSystems.remove(osId, function (error, response) {
            RobaDialog.hide();
            if (error) {
              RobaDialog.error("Delete failed: " + error.message);
            }
          });
        }
    );
  },
  "click .btn-add-os"(e, instance){
    let platformId = $(e.target).closest(".btn-add-os").attr("data-pk");
    if(platformId){
      let platformConfig = PlatformConfigurations.findOne(platformId);
      PlatformOperatingSystems.insert({
        projectId: platformConfig.projectId,
        projectVersionId: platformConfig.projectVersionId,
        platformId: platformId,
        title: 'New OS',
        versions: ['OS Version']
      }, function (error, response) {
        if (error) {
          RobaDialog.error("Adding os failed: " + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.PlatformOperatingSystems.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.PlatformOperatingSystems.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.PlatformOperatingSystems.onDestroyed(() => {
  
});

import './version_home.html';
import '../home.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Projects } from '../../../../../imports/api/projects/projects.js';
import { ProjectVersions } from '../../../../../imports/api/projects/project_versions.js';
import '../../../components/page_headers/current_project_header.js';
import '../home_nav.js';
import './version_activity.js';
import './version_credentials.js';
import './version_user_types_config.js';
import './version_data_types.js';
import './version_platform_config.js';
import './version_servers.js';
import './version_test_systems.js';

/**
 * Template Helpers
 */
Template.VersionHome.helpers({
  project() {
    return Template.instance().project.get()
  },
  version() {
    return Template.instance().version.get()
  }
});

/**
 * Template Event Handlers
 */
Template.VersionHome.events({});

/**
 * Template Created
 */
Template.VersionHome.onCreated(() => {
  let instance     = Template.instance();
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();
  
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    // Core data
    instance.subscribe("nodes", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
    
    // Datastores
    instance.subscribe("datastores", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("datastore_data_types", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_data_type_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_rows", projectId, projectVersionId);// TODO: Move to lower level template
    
    // Platform configuration
    instance.subscribe("platform_configurations", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("platform_operating_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("platform_viewports", projectId, projectVersionId);// TODO: Move to lower level template
    
    // Test infrastructure
    instance.subscribe("test_servers", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_agents", projectId, projectVersionId);// TODO: Move to lower level template
    
    // Cache the project and project version records
    instance.project.set(Projects.findOne(projectId));
    instance.version.set(ProjectVersions.findOne(projectVersionId));
  });
  
  // Segment the reactivity so that we are pulling in changes to th project and version record
  // without re-subscribing when those records change
  instance.autorun(function () {
    let projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    if (instance.subscriptionsReady()) {
      let project        = Projects.findOne(projectId),
          projectVersion = ProjectVersions.findOne(projectVersionId);
      
      // Cache the project and project version records
      instance.project.set(project);
      instance.version.set(projectVersion);
    }
  });
});

/**
 * Template Rendered
 */
Template.VersionHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.VersionHome.onDestroyed(() => {
  
});

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Random} from 'meteor/random';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {moment} from 'meteor/momentjs:moment';
import {numeral} from 'meteor/numeral:numeral';

// Utils
import {Util} from '../../api/util.js';
import {DocTreeConfig} from '../../../client/ui/lib/doc_tree/doc_tree_config.js';

// Collections
import {Actions} from '../../api/actions/actions.js';
import {Datastores} from '../../api/datastores/datastores.js';
import {DatastoreDataTypes} from '../../api/datastores/datastore_data_types.js';
import {Nodes} from '../../api/nodes/nodes.js';
import {Projects} from '../../api/projects/projects.js';
import {ProjectVersions} from '../../api/projects/project_versions.js';
import {TestServers} from '../../api/test_servers/test_servers.js';
import {TestAgents} from '../../api/test_agents/test_agents.js';
import {TestSystems} from '../../api/test_systems/test_systems.js';

// Enums
import {AdventureStatus, AdventureStatusLookup} from '../../api/adventures/adventure_status.js';
import {AdventureStepStatus, AdventureStepStatusLookup} from '../../api/adventures/adventure_step_status.js';
import {ChangeTypes, ChangeTypesLookup} from '../../api/change_tracker/change_types.js';
import {DatastoreCategories, DatastoreCategoriesLookup} from '../../api/datastores/datastore_catagories.js';
import {FieldTypes, FieldTypesLookup} from '../../api/datastores/field_types.js';
import {FunctionParamTypes, FunctionParamTypesLookup} from '../../api/code_modules/function_param_types.js';
import {NodeTypes, NodeTypesLookup} from '../../api/nodes/node_types.js';
import {NodeComparisonDatumResult, NodeComparisonDatumResultLookup} from '../../api/platform_types/node_comparison_datum_result.js';
import {PlatformTypes, PlatformTypesLookup} from '../../api/platform_types/platform_types.js';
import {ProjectRoles, ProjectRolesLookup} from '../../api/projects/project_roles.js';
import {ReferenceTypes, ReferenceTypesLookup} from '../../api/reference_docs/reference_types.js';
import {TestAgentOS, TestAgentOSLookup} from '../../api/test_agents/test_agent_os.js';
import {TestAgentTypes, TestAgentTypesLookup} from '../../api/test_agents/test_agent_types.js';
import {TestCaseStepTypes, TestCaseStepTypesLookup} from '../../api/test_cases/test_case_step_types.js';
import {TestResultCodes, TestResultCodesLookup} from '../../api/test_results/test_result_codes.js';
import {TestResultStatus, TestResultStatusLookup} from '../../api/test_results/test_result_status.js';
import {TestRunItemTypes, TestRunItemTypesLookup} from '../../api/test_runs/test_run_item_types.js';
import {TestSystemStatus, TestSystemStatusLookup} from '../../api/test_systems/test_system_status.js';

/**
 * Listen for page resize events
 */
Meteor.startup(function(){
  var self = {};

  // setup a resize event for redraw actions
  Session.set("resize", { timestamp: Date.now(), width: window.innerWidth, height: window.innerHeight });
  $(window).resize(function() {
    if(this.resizeTimeout){
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(function(){
      Session.set("resize", { timestamp: Date.now(), width: window.innerWidth, height: window.innerHeight });
    }.bind(self), 250);
  });

  // set the default setup for x-editable
  $.fn.editable.defaults.mode = "inline";
});

/**
 * Enums
 */
Template.registerHelper("AdventureStatus", () => { return AdventureStatus });
Template.registerHelper("AdventureStatusLookup", () => { return AdventureStatusLookup });
Template.registerHelper("AdventureStepStatus", () => { return AdventureStepStatus });
Template.registerHelper("AdventureStepStatusLookup", () => { return AdventureStepStatusLookup });
Template.registerHelper("ChangeTypes", () => { return ChangeTypes });
Template.registerHelper("ChangeTypesLookup", () => { return ChangeTypesLookup });
Template.registerHelper("DatastoreCategories", () => { return DatastoreCategories });
Template.registerHelper("DatastoreCategoriesLookup", () => { return DatastoreCategoriesLookup });
Template.registerHelper("FieldTypes", () => { return FieldTypes });
Template.registerHelper("FieldTypesLookup", () => { return FieldTypesLookup });
Template.registerHelper("FunctionParamTypes", () => { return FunctionParamTypes });
Template.registerHelper("FunctionParamTypesLookup", () => { return FunctionParamTypesLookup });
Template.registerHelper("NodeTypes", () => { return NodeTypes });
Template.registerHelper("NodeTypesLookup", () => { return NodeTypesLookup });
Template.registerHelper("NodeComparisonDatumResult", () => { return NodeComparisonDatumResult });
Template.registerHelper("NodeComparisonDatumResultLookup", () => { return NodeComparisonDatumResultLookup });
Template.registerHelper("PlatformTypes", () => { return PlatformTypes });
Template.registerHelper("PlatformTypesLookup", () => { return PlatformTypesLookup });
Template.registerHelper("ProjectRoles", () => { return ProjectRoles });
Template.registerHelper("ProjectRolesLookup", () => { return ProjectRolesLookup });
Template.registerHelper("ReferenceTypes", () => { return ReferenceTypes });
Template.registerHelper("ReferenceTypesLookup", () => { return ReferenceTypesLookup });
Template.registerHelper("TestAgentOS", () => { return TestAgentOS });
Template.registerHelper("TestAgentOSLookup", () => { return TestAgentOSLookup });
Template.registerHelper("TestAgentTypes", () => { return TestAgentTypes });
Template.registerHelper("TestAgentTypesLookup", () => { return TestAgentTypesLookup });
Template.registerHelper("TestCaseStepTypes", () => { return TestCaseStepTypes });
Template.registerHelper("TestCaseStepTypesLookup", () => { return TestCaseStepTypesLookup });
Template.registerHelper("TestResultCodes", () => { return TestResultCodes });
Template.registerHelper("TestResultCodesLookup", () => { return TestResultCodesLookup });
Template.registerHelper("TestResultStatus", () => { return TestResultStatus });
Template.registerHelper("TestResultStatusLookup", () => { return TestResultStatusLookup });
Template.registerHelper("TestRunItemTypes", () => { return TestRunItemTypes });
Template.registerHelper("TestRunItemTypesLookup", () => { return TestRunItemTypesLookup });
Template.registerHelper("TestSystemStatus", () => { return TestSystemStatus });
Template.registerHelper("TestSystemStatusLookup", () => { return TestSystemStatusLookup });

/**
 * Debug
 */
Template.registerHelper("debug", function(){
  if(arguments.length){
    var argv = _.toArray(arguments).slice(0, -1);
    if(typeof argv[0] == "string"){
      console.log(argv[0], argv.slice(1));
    } else {
      console.log("Debug: ", argv);
    }
  } else {
    console.log("Debug: ", this);
  }
});

/**
 * Subscriptions ready
 */
Template.registerHelper("ready", function(){
  return Template.instance().subscriptionsReady()
});

/**
 * Simple pathFor helper
 */
Template.registerHelper("pathFor", function (routeName, routeParams) {
  return FlowRouter.path(routeName, routeParams.hash);
});

/**
 * Set the page title
 */
Template.registerHelper("setTitle", function () {
  if(arguments.length){
    document.title = _.toArray(arguments).slice(0, -1).join(" ");
  }
});

/**
 * Get the title displayed in the main nav menu
 */
Template.registerHelper("setNavTitle", function () {
  if(arguments.length){
    Session.set("navTitle", _.toArray(arguments).slice(0, -1).join(" "));
  }
});

/**
 * Not Null helper
 */
Template.registerHelper("notNull", function(value){
  return value != null;
});

/**
 * Variable and function name validation helper
 */
Template.registerHelper("variablePattern", function(){
  return Util.variableInputPattern;
});

/**
 * Get a screen size relative height value
 */
Template.registerHelper("relativeHeight", function(proportion){
  if(proportion){
    var screenSize = Session.get("resize");
    if(screenSize.height){
      return parseInt(parseFloat(proportion) * screenSize.height);
    }
  }
});

Template.registerHelper("relativeWidth", function(proportion){
  if(proportion){
    var screenSize = Session.get("resize");
    if(screenSize.width){
      return parseInt(parseFloat(proportion) * screenSize.width);
    }
  }
});

/**
 * Determine if a field is custom
 */
Template.registerHelper("fieldIsCustom", function(field){
  field = field || this;
  return field && field.type == FieldTypes.custom;
});

/**
 * Quick general field renderer
 */
Template.registerHelper("renderValueByType", function (value){
  if(_.isBoolean(value)){
    return value ? "true" : "false"
  } else if(_.isDate(value)){
    return moment(value).format("MMM Do, YY");
  } else if(_.isObject(value)){
    return JSON.stringify(value);
  } else {
    return value;
  }
});

/**
 * Render a lookup value
 */
Template.registerHelper("renderLookup", function (lookupName, key, style) {
  if(lookupName && key !== undefined){
    var lookup = eval(lookupName);
    if(lookup){
      var name = lookup[key];
      if(name){
        if(style && style == "dash"){
          return Util.camelToDash(name);
        } else {
          return Util.camelToTitle(name);
        }
      } else {
        console.error("renderLookup failed: no key [" + key + "] in " + lookupName);
      }
    } else {
      console.error("renderLookup failed: lookup not found " + lookupName);
    }
  } else {
    //console.error("renderLookup failed: insufficient data [" + lookupName + "," + key + "]");
  }
});

/**
 * Render a node title
 */
Template.registerHelper("renderNodeTitle", function (staticId, projectVersionId) {
  check(staticId, String);
  check(projectVersionId, String);
  var node = Nodes.findOne({staticId: staticId, projectVersionId: projectVersionId});
  return node ? node.title : "";
});

/**
 * Render a user's name
 */
Template.registerHelper("renderUserDisplayName", function (userId) {
  if(userId){
    var user = Meteor.users.findOne(userId);
    if(user){
      return user.profile.name;
    }
  }
});

/**
 * Render a camel case string as words
 */
Template.registerHelper("renderCamelCaseAsWords", function (message) {
  if(message){
    return Util.camelToTitle(message);
  }
});

/**
 * Render a formatted date
 */
Template.registerHelper("dateFormat", function (date, format) {
  format = _.isString(format) ? format : "MMM Do, YY";
  if(date){
    return moment(date).format(format);
  }
});

/**
 * Render a formatted date
 */
Template.registerHelper("dateFromNow", function (date, hideSuffix) {
  hideSuffix = hideSuffix === true;
  if(date){
    return moment(date).fromNow(hideSuffix);
  }
});

/**
 * Render a formatted number
 */
Template.registerHelper("numberFormat", function (value, format) {
  return numeral(value).format(format);
});

/**
 * Render a formatted number
 */
Template.registerHelper("renderLogTime", function (value) {
  return numeral(value).format("0.000");
});

/**
 * Get a list of projects for a user, including their role
 */
Template.registerHelper("userProjects", function () {
  var user = Meteor.user();
  if(user && user.projectList){
    return Projects.find({_id: {$in: user.projectList}, active: true}, {sort: {title: 1}});
  }
  console.log("userProjects:", user);
});

/**
 * Get the role for this user for a given project
 */
Template.registerHelper("userRole", function (projectId) {
  projectId = (this ? this._id : this) || projectId;
  var user = Meteor.user();
  if(user && user.projects && user.projects[projectId] && user.projects[projectId].roles){
    var role = _.min(user.projects[projectId].roles);
    if(role != null){
      return ProjectRolesLookup[role]
    }
  }
});

/**
 * Check if a user has role permissions for a project
 */
Template.registerHelper("hasProjectAdminRole", function (projectId) {
  if(projectId && Meteor.userId()) {
    var user = Meteor.users.findOne(Meteor.userId());
    return user.hasAdminAccess(projectId);
  }
});

/**
 * Check if a user has role permissions for a project
 */
Template.registerHelper("hasRole", function (roleName, projectId) {
  if(roleName){
    var roleType = ProjectRoles[roleName];
    if(roleType){
      var user = Meteor.user();
      if(user && user.projects && user.projects[projectId] && user.projects[projectId].roles){
        return _.contains(user.projects[projectId].roles, roleType)
      }
    }
  }
  return false
});

/**
 * Get the list of versions for a project
 */
Template.registerHelper("projectVersions", function () {
  var project = this;
  if(project && project._id){
    return ProjectVersions.find({projectId: project._id}, {sort: {version: -1}});
  }
});

/**
 * Render a change type to a string
 */
Template.registerHelper("renderDataTypeTitle", function (staticId, projectVersionId) {
  if(staticId && projectVersionId){
    var customType = DatastoreDataTypes.findOne({staticId: staticId, projectVersionId: projectVersionId});
    if(customType){
      return customType.title;
    }
  }
});

/**
 * Render a test agent name
 */
Template.registerHelper("renderTestAgentName", function (testAgent) {
  return Util.getTestAgentNameWithVersion(testAgent);
});

/**
 * Render a test agent name from just the ID
 */
Template.registerHelper("renderTestAgentNameFromId", function (id) {
  var testAgent = TestAgents.findOne({_id: id});
  if(testAgent){
    return Util.getTestAgentNameWithVersion(testAgent);
  }
});

/**
 * Render a test agent name from just the static ID and project version
 */
Template.registerHelper("renderTestAgentNameFromStaticId", function (staticId, projectVersionId) {
  var testAgent = TestAgents.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(testAgent) {
    return Util.getTestAgentNameWithVersion(testAgent);
  }
});

/**
 * Render a server name
 */
Template.registerHelper("renderServerName", function (serverId) {
  var server = TestServers.findOne(serverId);
  if(server){
    return server.title;
  }
});

/**
 * Render a server name from a server staticId
 */
Template.registerHelper("renderServerNameFromStaticId", function (staticId, projectVersionId) {
  var server = TestServers.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(server){
    return server.title;
  }
});

/**
 * Render a test system name
 */
Template.registerHelper("renderTestSystemName", function (testSystemId) {
  var testSystem = TestSystems.findOne(testSystemId);
  if(testSystem){
    return testSystem.title;
  }
});

/**
 * Render a test system name from a test system staticId
 */
Template.registerHelper("renderTestSystemNameFromStaticId", function (staticId, projectVersionId) {
  var testSystem = TestSystems.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(testSystem){
    return testSystem.title;
  }
});

/**
 * Return or generate a unique ID for an element tied to a Template Instance
 */
Template.registerHelper("getElementId", function () {
  var instance = Template.instance();
  if(!instance.elementId){
    instance.elementId = "Element_" + Random.id();
    if(instance.elementIdReactor){
      instance.elementIdReactor.set(instance.elementId);
    }
  }
  return instance.elementId;
});

/**
 * Return a data-key based on a title or a value
 */
Template.registerHelper("titleKey", function (value) {
  let context = this;
  if(value){
    return Util.dataKey(value);
  } else if (context && context.title) {
    return Util.dataKey(context.title);
  } else if (context && context.name) {
    return Util.dataKey(context.name);
  }
});

/**
 * Get a version of a node
 */
Template.registerHelper("getNode", function (staticId, versionId) {
  if(staticId && versionId) {
    return Nodes.findOne({staticId: staticId, projectVersionId: versionId});
  }
});

/**
 * Get a version of an action
 */
Template.registerHelper("getAction", function (staticId, versionId) {
  if(staticId && versionId) {
    return Actions.findOne({staticId: staticId, projectVersionId: versionId});
  }
});

/**
 * Determine if an adventure is not in motion
 */
Template.registerHelper("adventureIsStill", function (context) {
  var adventure = context || this.adventure;
  return _.contains([
    AdventureStatus.awaitingCommand,
    AdventureStatus.paused,
    AdventureStatus.complete,
    AdventureStatus.error,
    AdventureStatus.failed
  ], adventure.status);
});

/**
 * Determine if an adventure is not in motion
 */
Template.registerHelper("adventureIsComplete", function (context) {
  var adventure = context || this.adventure;
  return adventure.status == AdventureStatus.complete || adventure.status == AdventureStatus.failed ;
});

/**
 * Determine if an adventure is paused
 */
Template.registerHelper("adventureIsPaused", function (context) {
  var adventure = context || this.adventure;
  return adventure.status == AdventureStatus.paused;
});

/**
 * Get the right data template for test result log data
 */
Template.registerHelper("LogMessageData", function (data) {
  // accept the param or default to this
  data = data || this;
  if(_.isString(data)){
    return "LogMessageDataString";
  } else if(_.isDate(data)){
    return "LogMessageDataString";
  } else if(_.isNumber(data)){
    return "LogMessageDataString";
  } else if(_.isArray(data)){
    return "LogMessageDataArray";
  } else if(_.isObject(data)){
    return "LogMessageDataObject";
  } else {
    return "LogMessageDataString";
  }
});

/**
 * Get an name of a test step type
 */
Template.registerHelper("testStepType", function (type) {
  type = type || this.type;
  if(type != null){
    return TestCaseStepTypesLookup[type];
  }
});

/**
 * Get an icon for a test step type
 */
Template.registerHelper("testStepTypeIcon", function (type) {
  type = type || this.type;
  return Util.testStepTypeIcon(type);
});

Template.registerHelper("join", function (list, joint) {
  joint = joint && _.isString(joint) ? joint : ", ";
  if(list){
    return _.filter(list, function (d) {return d != null;}).join(joint);
  }
});

Template.registerHelper("scale", function (number, scale) {
  if( number != null && scale != null){
    return number * scale;
  }
});

Template.registerHelper("stringify", function () {
  return JSON.stringify(this);
});

Template.registerHelper("btoa", function (value) {
  return btoa(value);
});

Template.registerHelper("atob", function (value) {
  return btoa(value);
});

/**
 * Helpers to return configuration
 */
Template.registerHelper("nodeConfig", function (key) {
  return DocTreeConfig.nodes[key];
});

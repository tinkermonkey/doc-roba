/**
 * set the default setup for x-editable
 */
$.fn.editable.defaults.mode = "inline";

/**
 * Debug
 */
Template.registerHelper("debug", function(){
  if(arguments.length){
    _.each(_.toArray(arguments).slice(0, -1), function (d, i){
      console.log("Debug: ", d);
    });
  } else {
    console.log("Debug: ", this);
  }
});

/**
 * Render a project role type to a string
 * TODO: Replace this with css
 */
Template.registerHelper("renderProjectRole", function (role) {
  var name = RoleTypesLookup[role];
  if(name){
    return name.substr(0,1).toUpperCase() + name.substr(1);
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
 * Render a node type to a string
 * TODO: Replace this with css
 */
Template.registerHelper("renderNodeType", function (type) {
  var name = NodeTypesLookup[type];
  if(name){
    return name.substr(0,1).toUpperCase() + name.substr(1);
  }
});

/**
 * Render a user's name with information from the Project Roles collection
 */
Template.registerHelper("renderNameByRole", function (userId) {
  var role;
  if(userId){
    role = ProjectRoles.findOne({userId: userId});
    if(role){
      return role.name;
    }
  }
});

/**
 * Render a change type to a string
 * TODO: Replace this with css
 */
Template.registerHelper("renderChangeType", function (type) {
  var name = ChangeTypesLookup[type];
  if(name){
    return name.substr(0,1).toUpperCase() + name.substr(1);
  }
});

/**
 * Render a camel case string as words
 */
Template.registerHelper("renderCamelCaseAsWords", function (message) {
  if(message){
    return message.replace(/([A-Z])/g, " $1").trim();
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
  var projects = [];
  ProjectRoles.find({userId: Meteor.userId()}).forEach(function (role) {
    var project = Projects.findOne({_id: role.projectId});
    if(project){
      project.role = role.role;
      projects.push(project);
    }
  });
  return projects;
});

/**
 * Get a list of projects for a user, including their role
 */
Template.registerHelper("userRole", function (projectId) {
  projectId = (this ? this._id : this) || projectId;
  var role = ProjectRoles.findOne({userId: Meteor.userId(), projectId: projectId});
  return role ? role.role : null;
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
 * Get the list of versions for a project
 */
Template.registerHelper("setTitle", function () {
  if(arguments.length){
    document.title = _.toArray(arguments).slice(0, -1).join(" ");
  }
});

/**
 * Render a change type to a string
 */
Template.registerHelper("renderFieldType", function (type) {
  var name = FieldTypesLookup[type];
  if(name){
    return name.substr(0,1).toUpperCase() + name.substr(1);
  }
});

/**
 * Render a change type to a string
 */
Template.registerHelper("renderCustomFieldType", function (type) {
  if(type){
    var customType = DataStores.findOne(type);
    if(customType){
      return customType.title;
    }
  }
});

/**
 * Render a test agent OS
 */
Template.registerHelper("renderTestAgentOS", function (os) {
  var name = TestAgentOSLookup[os];
  return name;
});

/**
 * Render a test agent type
 */
Template.registerHelper("renderTestAgentType", function (type) {
  var name = TestAgentTypesLookup[type];
  return Util.capitalize(name);
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
  var server = Servers.findOne(serverId);
  if(server){
    return server.title;
  }
});

/**
 * Render a server name from a server staticId
 */
Template.registerHelper("renderServerNameFromStaticId", function (staticId, projectVersionId) {
  var server = Servers.findOne({staticId: staticId, projectVersionId: projectVersionId});
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
 * Render an adventure status name
 */
Template.registerHelper("renderAdventureStatus", function (statusId) {
  return Util.capitalize(AdventureStatusLookup[statusId]);
});

/**
 * Render an action status name
 */
Template.registerHelper("renderAdventureStepStatus", function (statusId) {
  return Util.capitalize(AdventureStepStatusLookup[statusId]);
});

/**
 * Render a node search status piece
 */
Template.registerHelper("renderNodeSearchStatus", function (statusId) {
  return NodeSearchStatusLookup[statusId];
});

/**
 * Render a test case step type
 */
Template.registerHelper("renderTestCaseStepType", function (type) {
  return TestCaseStepTypesLookup[type];
});

/**
 * Check if a user has role permissions for a project
 */
Template.registerHelper("hasRole", function (roleName, projectId) {
  console.log("HasRole: ", roleName, projectId);
  if(roleName){
    var role = ProjectRoles.findOne({userId: Meteor.userId(), projectId: projectId}),
      hasRole = false;

    switch(roleName){
      case "admin":
        hasRole = _.contains([RoleTypes.owner, RoleTypes.admin], role.role);
        break;
      case "tester":
        hasRole = _.contains([RoleTypes.owner, RoleTypes.admin, RoleTypes.tester], role.role);
        break;
      case "documentation":
        hasRole = true;
        break;
    }
    return hasRole;
  }
});

/**
 * Return or generate a unique ID for an element tied to a Template Instance
 */
Template.registerHelper("getElementId", function () {
  var instance = Template.instance();
  if(!instance._elementId){
    instance._elementId = "Element_" + new Mongo.ObjectID()._str;
  }
  return instance._elementId;
});

/**
 *
 */
Template.registerHelper("getDataStoreSchema", function (dataStoreId) {
  if(!DataStoreSchemas[dataStoreId]){
    var dataStore = DataStores.findOne(dataStoreId);
    DataStoreSchemas[dataStoreId] = DSUtil.simpleSchema(dataStore.schema);
  }
  return DataStoreSchemas[dataStoreId];
});

/**
 * Return a safe data value for a user type
 */
Template.registerHelper("titleDataName", function (record) {
  var userType = record || this;
  if(userType.title){
    return userType.title.replace(/[\W]/g, "-").toLowerCase();
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
 * Render a data store row
 */
Template.registerHelper("renderDataStoreRow", function (rowId) {
  return DSUtil.renderRow(rowId);
});

/**
 * Get the right data template for test result log data
 */
Template.registerHelper("getLogDataTemplate", function (data) {
  // accept the param or default to this
  data = data || this;
  if(_.isString(data)){
    return "TestResultLogDataString";
  } else if(_.isDate(data)){
    return "TestResultLogDataString";
  } else if(_.isNumber(data)){
    return "TestResultLogDataString";
  } else if(_.isArray(data)){
    return "TestResultLogDataArray";
  } else if(_.isObject(data)){
    return "TestResultLogDataObject";
  } else {
    return "TestResultLogDataString";
  }
});

Template.registerHelper("stringify", function () {
  return JSON.stringify(this);
});

/**
 * Listen for resize events
 */
Meteor.startup(function(){
  var self = {};
  Session.set("resize", { timestamp: Date.now(), width: window.innerWidth, height: window.innerHeight });
  $(window).resize(function(event) {
    if(this.resizeTimeout){
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(function(){
      Session.set("resize", { timestamp: Date.now(), width: window.innerWidth, height: window.innerHeight });
    }.bind(self), 250);
  });
});
/**
 * Listen for page resize events
 */
Meteor.startup(function(){
  var self = {};

  // setup a resize event for redraw actions
  Session.set("resize", { timestamp: Date.now(), width: window.innerWidth, height: window.innerHeight });
  $(window).resize(function(event) {
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
 * Not Null helper
 */
Template.registerHelper("notNull", function(value){
  return value != null;
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
  if(lookupName && key != null){
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
        Meteor.log.error("renderLookup failed: no key [" + key + "] in " + lookupName);
      }
    } else {
      Meteor.log.error("renderLookup failed: lookup not found " + lookupName);
    }
  } else {
    Meteor.log.error("renderLookup failed: insufficient data [" + lookupName + "," + key + "]");
  }
});

/**
 * Render a node title
 */
Template.registerHelper("renderNodeTitle", function (staticId, projectVersionId) {
  check(staticId, String);
  check(projectVersionId, String);
  var node = Collections.Nodes.findOne({staticId: staticId, projectVersionId: projectVersionId});
  return node ? node.title : "";
});

/**
 * Render a user's name with information from the Project Roles collection
 */
Template.registerHelper("renderNameByRole", function (userId) {
  var role;
  if(userId){
    role = Collections.ProjectRoles.findOne({userId: userId});
    if(role){
      return role.name;
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
  Collections.ProjectRoles.find({userId: Meteor.userId()}).forEach(function (role) {
    var project = Collections.Projects.findOne({_id: role.projectId});
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
  var role = Collections.ProjectRoles.findOne({userId: Meteor.userId(), projectId: projectId});
  return role ? role.role : null;
});

/**
 * Get the list of versions for a project
 */
Template.registerHelper("projectVersions", function () {
  var project = this;
  if(project && project._id){
    return Collections.ProjectVersions.find({projectId: project._id}, {sort: {version: -1}});
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
Template.registerHelper("renderCustomFieldType", function (type) {
  if(type){
    var customType = Collections.DataStores.findOne(type);
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
  var testAgent = Collections.TestAgents.findOne({_id: id});
  if(testAgent){
    return Util.getTestAgentNameWithVersion(testAgent);
  }
});

/**
 * Render a test agent name from just the static ID and project version
 */
Template.registerHelper("renderTestAgentNameFromStaticId", function (staticId, projectVersionId) {
  var testAgent = Collections.TestAgents.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(testAgent) {
    return Util.getTestAgentNameWithVersion(testAgent);
  }
});

/**
 * Render a server name
 */
Template.registerHelper("renderServerName", function (serverId) {
  var server = Collections.Servers.findOne(serverId);
  if(server){
    return server.title;
  }
});

/**
 * Render a server name from a server staticId
 */
Template.registerHelper("renderServerNameFromStaticId", function (staticId, projectVersionId) {
  var server = Collections.Servers.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(server){
    return server.title;
  }
});

/**
 * Render a test system name
 */
Template.registerHelper("renderTestSystemName", function (testSystemId) {
  var testSystem = Collections.TestSystems.findOne(testSystemId);
  if(testSystem){
    return testSystem.title;
  }
});

/**
 * Render a test system name from a test system staticId
 */
Template.registerHelper("renderTestSystemNameFromStaticId", function (staticId, projectVersionId) {
  var testSystem = Collections.TestSystems.findOne({staticId: staticId, projectVersionId: projectVersionId});
  if(testSystem){
    return testSystem.title;
  }
});

/**
 * Check if a user has role permissions for a project
 */
Template.registerHelper("hasRole", function (roleName, projectId) {
  console.log("HasRole: ", roleName, projectId);
  if(roleName){
    var role = Collections.ProjectRoles.findOne({userId: Meteor.userId(), projectId: projectId}),
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
 * Return a safe data value for a user type
 */
Template.registerHelper("getDataName", function (value) {
  if(value){
    return value.replace(/[\W]/g, "-").toLowerCase();
  }
});

/**
 * Get a version of a node
 */
Template.registerHelper("getNode", function (staticId, versionId) {
  if(staticId && versionId) {
    return Collections.Nodes.findOne({staticId: staticId, projectVersionId: versionId});
  }
});

/**
 * Get a version of an action
 */
Template.registerHelper("getAction", function (staticId, versionId) {
  if(staticId && versionId) {
    return Collections.Actions.findOne({staticId: staticId, projectVersionId: versionId});
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
  joint = joint ? joint : ", ";
  if(list){
    return _.filter(list, function (d) {return d != null;}).join(", ");
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

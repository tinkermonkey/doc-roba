/**
 * ============================================================================
 * Documentation tree nodes
 * ============================================================================
 */
Schemas.UrlParameter = new SimpleSchema({
  order: {
    type: Number
  },
  // the parameter
  param: {
    type: String
  },
  // the value identifying this node
  value: {
    type: String
  }
});

/**
 * ============================================================================
 * Documentation tree nodes
 * ============================================================================
 */
Schemas.Node = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this node belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this node belongs
  projectVersionId: {
    type: String,
    index: true,
    denyUpdate: true
  },
  // Link to the parent node's staticId
  parentId: {
    type: String,
    optional: true,
    custom: function () {
      // Required for all non-root nodes
      var isRoot = this.field('type').value === NodeTypes.root;
      if (!isRoot && !this.isSet && (!this.operator || (this.value === null || this.value === ""))) {
        return "required";
      }
    }
  },
  // Document title, does not need to be unique
  title: {
    type: String
  },
  // local url for this page
  url: {
    type: String,
    optional: true
  },
  // Any url parameters which identify this page
  urlParameters: {
    type: [Schemas.UrlParameter],
    optional: true
  },
  // page title, from the page itself
  pageTitle: {
    type: String,
    optional: true
  },
  // A black box for type-specific configuration
  config: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Link to the static Type constant
  type: {
    type: Number,
    allowedValues: _.map(NodeTypes, function (d) { return d; })
  },
  // Code that determines when the node is ready
  readyCode: {
    type: String,
    optional: true
  },
  // Code that validates the node
  validationCode: {
    type: String,
    optional: true
  },
  // Links to the staticIds of navigation menu nodes found on this page
  navNodes: {
    type: [String],
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Nodes = new Mongo.Collection("nodes");
Nodes.attachSchema(Schemas.Node);
Nodes.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: ["staticId"]
});
Nodes.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(Nodes, "nodes");

/**
 * ============================================================================
 * Observe changes to the nodes to automatically pick up user type changes
 * Synchronize the changes to the data store representing that type
 * ============================================================================
 */
if(Meteor.isServer) {
  Nodes.after.insert(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // Create a new data store for users of this type
      DataStores.insert({
        title: node.title + " Users",
        dataKey: node._id,
        category: DataStoreCategories.userType,
        projectId: node.projectId,
        projectVersionId: node.projectVersionId,
        modifiedBy: node.modifiedBy,
        createdBy: node.createdBy
      });
    }
  });
  Nodes.after.update(function (userId, node, changedFields) {
    if(node.type === NodeTypes.userType) {
      if(_.contains(changedFields, "title")){
        // update the data store title
        DataStores.update({dataKey: node._id}, {$set: {title: node.title + " Users"}});
      }
    }
  });
  Nodes.after.remove(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // update the data store title
      DataStores.update({dataKey: node._id}, {$set: {deleted: true}});
    }
  });
}

/**
 * ============================================================================
 * Node Reference Documentation
 * ============================================================================
 */
NodeReferences = new Mongo.Collection("node_references");

/**
 * ============================================================================
 * User Projects
 * ============================================================================
 */
Schemas.Project = new SimpleSchema({
  title: {
    type: String
  },
  owner: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  logo: {
    type: String,
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Projects = new Mongo.Collection("projects");
Projects.attachSchema(Schemas.Project);
Projects.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
Projects.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['owner']
});
trackChanges(Projects, "projects");

/**
 * ============================================================================
 * User Project Versions
 * ============================================================================
 */
Schemas.ProjectVersion = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  version: {
    type: String
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
ProjectVersions = new Mongo.Collection("project_versions");
ProjectVersions.attachSchema(Schemas.ProjectVersion);
ProjectVersions.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
ProjectVersions.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(ProjectVersions, "project_versions");

/**
 * ============================================================================
 * User Project Roles
 * ============================================================================
 */
Schemas.ProjectRole = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  userId: {
    type: String,
    denyUpdate: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  role: {
    type: Number,
    allowedValues: _.map(RoleTypes, function (d) { return d; })
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
ProjectRoles = new Mongo.Collection("project_roles");
ProjectRoles.attachSchema(Schemas.ProjectRole);
ProjectRoles.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
ProjectRoles.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(ProjectRoles, "project_roles");

/**
 * ============================================================================
 * Schema for action routes
 * ============================================================================
 */
Schemas.ActionRoute = new SimpleSchema({
  // Order of this route in the action's routes
  order: {
    type: Number
  },
  // Static ID of the node this route leads to
  nodeId: {
    type: String
  },
  // The js code which tests this route
  routeCode: {
    type: String,
    defaultValue: ""
  }
});

/**
 * ============================================================================
 * Schema for action variables
 * ============================================================================
 */
Schemas.ActionVariable = new SimpleSchema({
  // Order to show it in, this has no practical purpose
  order: {
    type: Number
  },
  // Static ID of the node this route leads to
  name: {
    type: String
  },
  // The type of the variable
  type: {
    type: Number,
    allowedValues: _.map(FieldTypes, function (d) { return d; })
  },
  // The custom type if this is complex
  customFieldType: {
    type: String,
    optional: true
  },
  // The js code which tests this route
  varIsArray: {
    type: Boolean,
    defaultValue: false
  }
});

/**
 * ============================================================================
 * Automation actions
 * ============================================================================
 */
Schemas.Action = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this node belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this node belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Document title, does not need to be unique
  title: {
    type: String
  },
  // Link to the static ID of the From node
  nodeId: {
    type: String
  },
  // Keep track of data requirements
  variables: {
    type: [ Schemas.ActionVariable ],
    optional: true
  },
  // Store the decisions which lead to the various nodes
  routes: {
    type: [ Schemas.ActionRoute ]
  },
  // The code to execute the action
  code: {
    type: String,
    defaultValue: ""
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Actions = new Mongo.Collection("actions");
Actions.attachSchema(Schemas.Action);
Actions.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Actions.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(Actions, "actions");

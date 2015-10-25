/**
 * ============================================================================
 * Global helper schemas that are not tied to a single collection
 * ============================================================================
 */

/**
 * Viewport
 */
Schemas.Viewport = new SimpleSchema({
  title: {
    label: "Title",
    type: String
  },
  height: {
    label: "Height (px)",
    type: Number
  },
  width: {
    label: "Width (px)",
    type: Number
  }
});

/**
 * Web configuration
 */
Schemas.WebPlatformConfig = new SimpleSchema({
  viewports: {
    label: "Viewports",
    type: [Schemas.Viewport]
  }
});

/**
 * Mobile Web Configuration
 */
Schemas.MobileWebPlatformConfig = new SimpleSchema({
  viewports: {
    label: "Viewports",
    type: [Schemas.Viewport]
  }
});

/**
 * Mobile App Configuration
 */
Schemas.MobileAppPlatformConfig = new SimpleSchema({

});

/**
 * Email Configuration
 */
Schemas.EmailPlatformConfig = new SimpleSchema({

});

/**
 * Generalized code snippets which are attached to various objects
 */
//TODO: replace inline code storage with this abstraction
Schemas.CodeSnippet = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this group belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this group belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // The collection to which this belongs
  collectionName: {
    type: String,
    denyUpdate: true
  }
});

/**
 * ============================================================================
 * URL parameter definition
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
    type: String,
    optional: true
  }
});

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
    defaultValue: "",
    optional: true
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
    allowedValues: _.values(FieldTypes)
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
  },
  // Default value
  defaultValue: {
    type: String,
    optional: true,
    defaultValue: ""
  }
});

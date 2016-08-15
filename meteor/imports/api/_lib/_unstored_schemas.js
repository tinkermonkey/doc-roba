/**
 * Global helper schemas that are not tied to a single collection
 */

/**
 * Viewport
 */
Viewport = new SimpleSchema({
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
WebPlatformConfig = new SimpleSchema({
  viewports: {
    label: "Viewports",
    type: [Viewport]
  }
});

/**
 * Mobile Web Configuration
 */
MobileWebPlatformConfig = new SimpleSchema({
  viewports: {
    label: "Viewports",
    type: [Viewport]
  }
});

/**
 * Mobile App Configuration
 */
MobileAppPlatformConfig = new SimpleSchema({

});

/**
 * Email Configuration
 */
EmailPlatformConfig = new SimpleSchema({

});

/**
 * Generalized code snippets which are attached to various objects
 */
//TODO: replace inline code storage with this abstraction
CodeSnippet = new SimpleSchema({
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

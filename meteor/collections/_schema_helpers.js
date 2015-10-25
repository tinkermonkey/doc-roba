/**
 * Top level object to capture all of the schemas
 */
Schemas = {};

/**
 * Enable debug for the moment
 */
FS.debug = true;

// TODO: Make this dynamic or a setting
FS.basePath = "/Users/austinsand/Workspace/doc-roba/files/";

/**
 * Thumbnail processor
 */
FS.createThumb = function(fileObj, readStream, writeStream) {
  // Transform the image into a 200x200px thumbnail
  gm(readStream, fileObj.name()).resize("200", "200").stream().pipe(writeStream);
};

/**
 * ============================================================================
 * Global helper functions used in the schemas
 * ============================================================================
 */
// Generate an ID value if one does not exist
autoValueObjectId = function () {
  // only set this field if there is not an existing value
  if(!this.isSet && this.isInsert){
    return new Mongo.ObjectID()._str;
  }
};

// Return the data created if this is an insert operation
autoValueDateCreated = function () {
  // Check if the value is already set, and respect it if it s
  if(this.isInsert){
    return new Date;
  } else if (this.isUpsert) {
    return { $setOnInsert: new Date };
  }
};

// Return a new date
autoValueDateModified = function () {
  return new Date;
};

// Return the current user if this is an insert
autoValueCreatedBy = function () {
  if(this.userId){
    // Check if the value is already set, and respect it if it s
    if(this.isInsert){
      return this.userId;
    } else if (this.isUpsert) {
      return { $setOnInsert: this.userId };
    }
  }
};

// Return the userId
autoValueModifiedBy = function () {
  if(this.userId){
    return this.userId;
  }
};

// Auto update the order of any ordered lists
autoUpdateOrder = function (collection, orderedFields) {
  // Only run on the server
  if(!Meteor.isServer){
    return;
  }

  // After update tracking
  collection.after.update(function (userId, record, changedFields) {
    _.each(orderedFields, function (orderedField) {
      if(_.contains(changedFields, orderedField)){
        // re-order the values quietly
        var update = {},
          sortedValues = record[orderedField].sort(function (value) { return value.order });
        _.each(sortedValues, function (value, i) {
          if(value.order !== i){
            update[orderedField + "." + i + ".order"] = i;
          }
        });
        if(_.keys(update).length){
          console.log("autoUpdateOrder Update: ", update);
          collection.direct.update(record._id, {$set: update});
        }
      }
    });
  });
};

/**
 * ============================================================================
 * Global allow/deny functions
 * ============================================================================
 */
allowIfAuthenticated = function (userId, doc) {
  return userId !== null;
};
allowIfAdmin = function (userId, doc) {
  var pr = ProjectRoles.findOne({userId: userId, projectId: doc.projectId});
  return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
};
allowIfTester = function (userId, doc) {
  var pr = ProjectRoles.findOne({userId: userId, projectId: doc.projectId});
  return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner || pr.role === RoleTypes.tester));
};
denyIfNotAuthenticated = function (userId, doc) {
  return userId == null || userId == false;
};

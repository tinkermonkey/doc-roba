/**
 * Top level object to capture all of the schemas
 */
Schemas = {};
Collections = {
  Users: Meteor.users
};

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
  if(Meteor.isServer){
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
            Meteor.log.debug("autoUpdateOrder Update: ", update);
            collection.direct.update(record._id, {$set: update});
          }
        }
      });
    });
  }
};

/**
 * Common helper functions used by collections
 */
export const SchemaHelpers = {
  /**
   * Generate an ID value if one does not exist
   * @returns {String}
   */
  autoValueObjectId() {
    // only set this field if there is not an existing value
    if(!this.isSet && this.isInsert){
      return new Mongo.ObjectID()._str;
    }
  },
  
  /**
   * Return the current date if this is an insert operation
   * @returns {Date}
   */
  autoValueDateCreated() {
    // Check if the value is already set, and respect it if it s
    if(this.isInsert){
      return new Date;
    } else if (this.isUpsert) {
      return { $setOnInsert: new Date };
    }
  },
  
  /**
   * Return the current date
   * @returns {Date}
   */
  autoValueDateModified() {
    return new Date;
  },
  
  /**
   * Return the current userId if this is an insert
   * @returns {String}
   */
  autoValueCreatedBy() {
    if(this.userId){
      // Check if the value is already set, and respect it if it s
      if(this.isInsert){
        return this.userId;
      } else if (this.isUpsert) {
        return { $setOnInsert: this.userId };
      }
    }
  },
  
  /**
   * Return the current userId
   * @returns {String}
   */
  autoValueModifiedBy() {
    if(this.userId){
      return this.userId;
    }
  },
  
  /**
   * Maintains ordering for sub-sets of a collection
   * @param collection
   * @param orderedFields
   */
  autoUpdateOrder(collection, orderedFields) {
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
              console.debug("autoUpdateOrder Update: ", update);
              collection.direct.update(record._id, {$set: update});
            }
          }
        });
      });
    }
  }
}

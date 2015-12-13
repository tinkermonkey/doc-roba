/**
 * Template Helpers
 */
Template.VersionServerConfig.helpers({
  getDataStore: function () {
    var context = this,
      ds = Collections.DataStores.findOne({dataKey: "server_config_" + context.version._id});
    if(!ds){
      Collections.DataStores.insert({
        projectVersionId: context.version._id,
        projectId: context.project._id,
        dataKey: "server_config_" + context.version._id,
        title: context.project.title + " " + context.version.version + " server configuration",
        category: DataStoreCategories.serverConfig
      });
      ds = Collections.DataStores.findOne({dataKey: "server_config_" + context.version._id});
    }
    return ds;
  }
});

/**
 * Template Event Handlers
 */
Template.VersionServerConfig.events({});

/**
 * Template Created
 */
Template.VersionServerConfig.created = function () {
  
};

/**
 * Template Rendered
 */
Template.VersionServerConfig.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.VersionServerConfig.destroyed = function () {
  
};

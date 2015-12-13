/**
 * On startup, check to see if the demo data should be loaded
 */
Meteor.startup(function(){
  if (Collections.Projects.find().count() == 0 && Collections.Nodes.find().count() == 0) {
    Meteor.log.info("No data found, executing data fixture");
  }

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
    /**
     * exportDemoData
     */
    exportDemoData: function () {
      Meteor.log.info("exportDemoData called");
      //Meteor.bindEnvironment(function () {
        DemoDataHandler.exportData();
      //});
    }
  });
});

/**
 * Singleton to handle import export tasks
 */
var DemoDataHandler = {
  // The location the files will be stored
  dataPath: '../demo_data',
  fileRegex: /\.json\.zip$/,

  // These collections will be exported
  collectionList: [
    "Actions",
    "DataStores",
    "DataStoreFields",
    "DataStoreRows",
    "DriverCommands",
    "Nodes",
    "Projects",
    "ProjectVersions",
    "ReferenceDocs", // Figure out how to best store and import the files
    "Screenshots", // Figure out how to best store and import the files
    "Servers",
    "TestAgents",
    "TestCases",
    "TestCaseRoles",
    "TestCaseSteps",
    "TestGroups",
    "TestResults",
    "TestResultRoles",
    "TestResultSteps",
    "TestRuns",
    "TestRunStages",
    "TestRunTemplates",
    "TestRunTemplateItems",
    "TestSystems"
  ],

  /**
   * Export all of the data
   */
  exportData: function () {
    console.log("DemoDataHandler.exportData");
    var dataDir = path.join(DocRoba.rootPath, DemoDataHandler.dataPath);

    Meteor.log.debug("DemoDataHandler.exportData data folder: " + dataDir);

    // clear out the directory if it exists
    if(fs.existsSync()){
      Meteor.log.info("DemoDataHandler.exportData removing existing files");
      fs.readdirSync(dataDir)
        .filter(function (filepath) {
          return path.basename(filepath).match(DemoDataHandler.fileRegex) != null
        })
        .forEach(function(filepath) {
          Meteor.log.info("Removing file: " + filepath);
          fs.unlinkSync(path.join(dataDir, filepath));
        });
    } else {
      // create the folder
      Meteor.log.info("DemoDataHandler.exportData creating data directory: " + dataDir);
      fs.mkdirSync(dataDir);
    }
    
    // export the collections
  }
};
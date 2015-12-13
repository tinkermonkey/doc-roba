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
  fileRegex: /\.json$|\.json\.zip/,
  encoding: 'utf8',

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
   * Export all demo data
   */
  exportData: function () {
    console.log("DemoDataHandler.exportData");
    var dataDir = path.join(DocRoba.rootPath, DemoDataHandler.dataPath);

    Meteor.log.debug("DemoDataHandler.exportData data folder: " + dataDir);

    // clear out the directory if it exists
    if(fs.existsSync(dataDir)){
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
    DemoDataHandler.collectionList.forEach(function (collectionName) {
      // open a file for the collection
      var collectionFilePath = path.join(dataDir, collectionName + ".json"),
        cursor = Collections[collectionName].find({});
      DemoDataHandler.exportRecords(cursor, collectionFilePath, collectionName);
    });

    // export the users
    var usersFilePath = path.join(dataDir, "Users.json");
    DemoDataHandler.exportRecords(Meteor.users.find({}, {fields: {
      "services.resume": 0,
      "services.singleUse": 0
    }}), usersFilePath, "Users");

    Meteor.log.info("DemoDataHandler.exportData complete");
  },

  /**
   * Export a particular collection
   */
  exportRecords: function (cursor, jsonFilePath, collectionName) {
    // open a file for the collection
    var output = "",
      recordCount = cursor.count();

    Meteor.log.info("DemoDataHandler.exportData exporting " + collectionName + " (" + recordCount + " records)");

    // start the JSON file
    output += "[\n";
    cursor.forEach(function (record, i) {
      output += JSON.stringify(record) + (i < recordCount - 1 ? ",\n" : "\n");
    });
    output += "]\n";

    // Zip it
    var zipFile = new AdmZip();
    zipFile.addFile(path.basename(jsonFilePath), new Buffer(output, DemoDataHandler.encoding), collectionName);
    zipFile.writeZip(jsonFilePath + ".zip");
  }
};
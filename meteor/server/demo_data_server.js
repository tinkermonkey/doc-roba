/**
 * On startup, check to see if the demo data should be loaded
 */
Meteor.startup(function(){
  if (Collections.Projects.find().count() == 0 && Collections.Nodes.find().count() == 0) {
    Meteor.log.info("No data found, executing data fixture");
    DemoDataHandler.importData();
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
      DemoDataHandler.exportData();
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
    Meteor.log.info("DemoDataHandler.exportData");
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
          Meteor.log.debug("Removing file: " + filepath);
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

    // export log messages for test results
    var logMessagePath = path.join(dataDir, "LogMessages.json");
    DemoDataHandler.exportRecords(Collections.LogMessages.find({testResultRoleId: {$exists: 1}}), logMessagePath, "LogMessages");

    Meteor.log.info("DemoDataHandler.exportData complete");
  },

  /**
   * Export a particular collection
   * @param cursor          Collection cursor pointing to records to export
   * @param jsonFilePath    Path to the json file to export to
   * @param collectionName  The name of the collection to tag the data with
   */
  exportRecords: function (cursor, jsonFilePath, collectionName) {
    var output = "",
      recordCount = cursor.count();

    Meteor.log.info("DemoDataHandler.exportRecords exporting " + collectionName + " (" + recordCount + " records)");

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
  },

  /**
   * Import all demo data
   */
  importData: function () {
    Meteor.log.info("DemoDataHandler.importData");
    var dataDir = path.join(DocRoba.rootPath, DemoDataHandler.dataPath);

    Meteor.log.debug("DemoDataHandler.importData data folder: " + dataDir);

    // clear out the directory if it exists
    if(fs.existsSync(dataDir)){
      Meteor.log.debug("DemoDataHandler.importData scanning data files");
      fs.readdirSync(dataDir)
        .filter(function (filepath) {
          return path.basename(filepath).match(DemoDataHandler.fileRegex) != null
        })
        .forEach(function(filepath) {
          DemoDataHandler.importRecords(path.join(dataDir, filepath));
        });
    } else {
      // create the folder
      Meteor.log.error("DemoDataHandler.importData data directory didn't exist: " + dataDir);
    }

    Meteor.log.info("DemoDataHandler.importData complete");
  },

  /**
   * Export a particular collection
   * @param zipFilePath Path to the zip file to import
   */
  importRecords: function (zipFilePath) {
    var input = "",
      recordCount = 0;

    Meteor.log.info("DemoDataHandler.importRecords importing " + path.basename(zipFilePath) );

    // Unzip it
    var zipFile = new AdmZip(zipFilePath),
      zipEntries = zipFile.getEntries();
    if(zipEntries){
      zipEntries.forEach(function (zipEntry) {
        if(zipEntry.entryName && zipEntry.entryName.match(/\.json$/)){
          Meteor.log.debug("DemoDataHandler.importRecords reading file " + zipEntry.entryName );

          var input = zipFile.readAsText(zipEntry, DemoDataHandler.encoding);
          try {
            var data = JSON.parse(input),
              collectionName = zipEntry.entryName.replace(/\.json$/i, "");
            Meteor.log.debug("DemoDataHandler.importRecords found " + data.length + " records for " + collectionName );
          } catch (e) {
            Meteor.log.error("DemoDataHandler.importRecords JSON parse failed: " + e.toString());
          }

          if(Collections[collectionName]){
            data.forEach(function (record) {
              // Use the direct method to circumvent the collection hooks
              if(Collections[collectionName] && Collections[collectionName].direct){
                Collections[collectionName].direct.insert(record);
              } else {
                // CollectionFS doesn't have hooks and I have to figure out how to encode the file data
                //Collections[collectionName].insert(record);

              }
            });
          } else {
            Meteor.log.error("DemoDataHandler.importRecords failed: collection [" + collectionName + "] not found");
          }
        }
      });
    } else {
      Meteor.log.error("Zip file didn't contain any zip entries: " + zipFilePath);
    }
  }
};
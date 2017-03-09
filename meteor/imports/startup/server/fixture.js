import {Meteor} from 'meteor/meteor';
import {DocRoba} from '../../api/doc_roba.js';
var AdmZip = require('adm-zip'),
    fs = require('fs'),
    path = require('path');

// Full collections
import {Actions}                  from '../../api/actions/actions.js';
import {CodeModules}              from '../../api/code_modules/code_modules.js';
import {CodeModuleFunctions}      from '../../api/code_modules/code_module_functions.js';
import {CodeModuleFunctionParams} from '../../api/code_modules/code_module_function_params.js';
import {Datastores}               from '../../api/datastores/datastores.js';
import {DatastoreDataTypes}       from '../../api/datastores/datastore_data_types.js';
import {DatastoreDataTypeFields}  from '../../api/datastores/datastore_data_type_fields.js';
import {DatastoreFields}          from '../../api/datastores/datastore_fields.js';
import {DatastoreRows}            from '../../api/datastores/datastore_rows.js';
import {DriverCommands}           from '../../api/driver_commands/driver_commands.js';
import {Nodes}                    from '../../api/nodes/nodes.js';
import {Projects}                 from '../../api/projects/projects.js';
import {ProjectVersions}          from '../../api/projects/project_versions.js';
import {ReferenceDocs}            from '../../api/reference_docs/reference_docs.js';
import {Screenshots}              from '../../api/screenshots/screenshots.js';
import {TestServers}              from '../../api/test_server/test_server.js';
import {TestAgents}               from '../../api/test_agents/test_agents.js';
import {TestCases}                from '../../api/test_cases/test_cases.js';
import {TestCaseRoles}            from '../../api/test_cases/test_case_roles.js';
import {TestCaseSteps}            from '../../api/test_cases/test_case_step.js';
import {TestGroups}               from '../../api/test_cases/test_group.js';
import {TestResults}              from '../../api/test_result/test_result.js';
import {TestResultRoles}          from '../../api/test_result/test_result_role.js';
import {TestResultSteps}          from '../../api/test_result/test_result_step.js';
import {TestRuns}                 from '../../api/test_run/test_run.js';
import {TestRunStages}            from '../../api/test_run/test_run_stage.js';
import {TestPlans}                from '../../api/test_plan/test_plan.js';
import {TestPlanItems}            from '../../api/test_plan/test_plan_item.js';
import {TestSystems}              from '../../api/test_system/test_system.js';
import {Users}                    from '../../api/users/users.js';

// Partial collection export
import {LogMessages}            from '../../api/log_messages/log_messages.js';

/**
 * On startup, check to see if the fixture data should be loaded
 */
Meteor.startup(() =>{
  if (Projects.find().count() == 0 && Nodes.find().count() == 0) {
    console.info("=====================================");
    console.info("No data found, executing data fixture...");
    FixtureDataHandler.importData();
    console.info("...Fixture complete");
    console.info("=====================================");
  }
  
  /**
   * Provide a means for testing the export
   */
  Meteor.methods({
    /**
     * exportFixtureData
     */
    exportFixtureData() {
      console.info("exportFixtureData called");
      FixtureDataHandler.exportData();
    }
  });
});

/**
 * Singleton to handle import export tasks
 */
var collectionList = {
      Actions: Actions,
      CodeModules: CodeModules,
      CodeModuleFunctions: CodeModuleFunctions,
      CodeModuleFunctionParams: CodeModuleFunctionParams,
      Datastores: Datastores,
      DatastoreDataTypes: DatastoreDataTypes,
      DatastoreDataTypeFields: DatastoreDataTypeFields,
      DatastoreFields: DatastoreFields,
      DatastoreRows: DatastoreRows,
      DriverCommands: DriverCommands,
      LogMessages: LogMessages,
      Nodes: Nodes,
      Projects: Projects,
      ProjectVersions: ProjectVersions,
      ReferenceDocs: ReferenceDocs, // Figure out how to best store and import the files
      Screenshots: Screenshots, // Figure out how to best store and import the files
      TestServers: TestServers,
      TestAgents: TestAgents,
      TestCases: TestCases,
      TestCaseRoles: TestCaseRoles,
      TestCaseSteps: TestCaseSteps,
      TestGroups: TestGroups,
      TestResults: TestResults,
      TestResultRoles: TestResultRoles,
      TestResultSteps: TestResultSteps,
      TestRuns: TestRuns,
      TestRunStages: TestRunStages,
      TestPlans: TestPlans,
      TestPlanItems: TestPlanItems,
      TestSystems: TestSystems,
      Users: Users
    },
    FixtureDataHandler = {
      // The location the files will be stored
      dataPath: '../fixture-data',
      fileRegex: /\.json$|\.json\.zip/,
      encoding: 'utf8',
      
      // These full collections will be exported
      
      /**
       * Export all fixture data
       */
      exportData() {
        console.info("FixtureDataHandler.exportData");
        var handler = this,
            dataDir = path.join(DocRoba.rootPath, handler.dataPath);
        
        console.debug("FixtureDataHandler.exportData data folder: " + dataDir);
        
        // remove log messages and users from the collections list because they'll be handled differently
        delete collectionList.LogMessages;
        delete collectionList.Users;
        
        // clear out the directory if it exists
        if(fs.existsSync(dataDir)){
          console.info("FixtureDataHandler.exportData removing existing files");
          fs.readdirSync(dataDir)
              .filter((filepath) => {
                return path.basename(filepath).match(handler.fileRegex) != null
              })
              .forEach((filepath) => {
                console.debug("Removing file: " + filepath);
                fs.unlinkSync(path.join(dataDir, filepath));
              });
        } else {
          // create the folder
          console.info("FixtureDataHandler.exportData creating data directory: " + dataDir);
          fs.mkdirSync(dataDir);
        }
        
        // export the collections
        _.keys(collectionList).forEach((collectionName) => {
          // open a file for the collection
          var collectionFilePath = path.join(dataDir, collectionName + ".json"),
              cursor = collectionList[collectionName].find({});
          handler.exportRecords(cursor, collectionFilePath, collectionName);
        });
        
        // export the users
        var usersFilePath = path.join(dataDir, "Users.json");
        handler.exportRecords(Meteor.users.find({}, {fields: {
          "services.resume": 0,
          "services.singleUse": 0
        }}), usersFilePath, "Users");
        
        // export log messages for test results
        var logMessagePath = path.join(dataDir, "LogMessages.json");
        handler.exportRecords(LogMessages.find({testResultRoleId: {$exists: 1}}), logMessagePath, "LogMessages");
        
        console.info("FixtureDataHandler.exportData complete");
      },
      
      /**
       * Export a particular collection
       * @param cursor          Collection cursor pointing to records to export
       * @param jsonFilePath    Path to the json file to export to
       * @param collectionName  The name of the collection to tag the data with
       */
      exportRecords(cursor, jsonFilePath, collectionName) {
        var handler = this,
            output = "",
            recordCount = cursor.count();
        
        console.info("FixtureDataHandler.exportRecords exporting " + collectionName + " (" + recordCount + " records)");
        
        // start the JSON file
        output += "[\n";
        cursor.forEach((record, i) => {
          output += JSON.stringify(record) + (i < recordCount - 1 ? ",\n" : "\n");
        });
        output += "]\n";
        
        // Zip it
        var zipFile = new AdmZip();
        zipFile.addFile(path.basename(jsonFilePath), new Buffer(output, handler.encoding), collectionName);
        zipFile.writeZip(jsonFilePath + ".zip");
      },
      
      /**
       * Import all fixture data
       */
      importData() {
        console.info("FixtureDataHandler.importData");
        var handler = this,
            dataDir = path.join(DocRoba.rootPath, handler.dataPath);
        
        console.debug("FixtureDataHandler.importData data folder: " + dataDir);
        
        if(fs.existsSync(dataDir)){
          console.debug("FixtureDataHandler.importData scanning data files");
          fs.readdirSync(dataDir)
              .filter((filepath) => {
                return path.basename(filepath).match(handler.fileRegex) != null
              })
              .forEach((filepath) => {
                handler.importRecords(path.join(dataDir, filepath));
              });
        } else {
          // create the folder
          console.error("FixtureDataHandler.importData data directory didn't exist: " + dataDir);
        }
        
        console.info("FixtureDataHandler.importData complete");
      },
      
      /**
       * Export a particular collection
       * @param filePath Path to the zip file to import
       */
      importRecords(filePath) {
        var handler = this,
            data, collectionName;
        
        console.info("FixtureDataHandler.importRecords importing " + path.basename(filePath) );
        
        // Unzip it if needed
        if(filePath.match(/\.zip$/)){
          var zipFile = new AdmZip(filePath),
              zipEntries = zipFile.getEntries();
          if(zipEntries){
            zipEntries.forEach((zipEntry) => {
              if(zipEntry.entryName && zipEntry.entryName.match(/\.json$/)){
                console.debug("FixtureDataHandler.importRecords reading file " + zipEntry.entryName );
            
                var input = zipFile.readAsText(zipEntry, handler.encoding);
                try {
                  data = JSON.parse(input);
                  collectionName = zipEntry.entryName.replace(/\.json$/i, "");
                  console.debug("FixtureDataHandler.importRecords found " + data.length + " records for " + collectionName );
                } catch (e) {
                  console.error("FixtureDataHandler.importRecords JSON parse failed: " + e.toString());
                }
              }
            });
          } else {
            console.error("Zip file didn't contain any zip entries: " + filePath);
          }
        } else {
          // read a raw json file
          try {
            var input = fs.readFileSync(filePath, handler.encoding);
            data = JSON.parse(input);
            collectionName = path.basename(filePath).replace(/\.json$/i, "");
          } catch (e) {
            console.error("JSON file didn't contain any entries: " + filePath);
          }
        }
        
        if(data && collectionName && collectionList[collectionName]){
          data.forEach((record) => {
            // Use the direct method to circumvent the collection hooks
            if(collectionList[collectionName] && collectionList[collectionName].direct){
              collectionList[collectionName].direct.insert(record);
            } else {
              // CollectionFS doesn't have hooks and I have to figure out how to encode the file data
              //collectionList[collectionName].insert(record);
            
            }
          });
        } else {
          console.error("FixtureDataHandler.importRecords failed: collection [" + collectionName + "] not found");
        }
      }
    };
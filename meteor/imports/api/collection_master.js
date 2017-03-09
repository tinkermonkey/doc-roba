// Import all of the collections
import {Actions}                  from './action/action.js';
import {CodeModules}              from './code_module/code_module.js';
import {CodeModuleFunctions}      from './code_module/code_module_function.js';
import {CodeModuleFunctionParams} from './code_module/code_module_function_param.js';
import {Datastores}               from './datastore/datastore.js';
import {DatastoreDataTypes}       from './datastore/datastore_data_type.js';
import {DatastoreDataTypeFields}  from './datastore/datastore_data_type_field.js';
import {DatastoreFields}          from './datastore/datastore_field.js';
import {DatastoreRows}            from './datastore/datastore_row.js';
import {DriverCommands}           from './driver_command/driver_command.js';
import {LogMessages}              from './log_message/log_message.js';
import {Nodes}                    from './nodes/nodes.js';
import {Projects}                 from './project/project.js';
import {ProjectVersions}          from './project/project_version.js';
import {ReferenceDocs}            from './reference_doc/reference_doc.js';
import {Screenshots}              from './screenshot/screenshot.js';
import {TestServers}              from './test_server/test_server.js';
import {TestAgents}               from './test_agent/test_agent.js';
import {TestCases}                from './test_case/test_case.js';
import {TestCaseRoles}            from './test_case/test_case_role.js';
import {TestCaseSteps}            from './test_case/test_case_step.js';
import {TestGroups}               from './test_case/test_group.js';
import {TestResults}              from './test_result/test_result.js';
import {TestResultRoles}          from './test_result/test_result_role.js';
import {TestResultSteps}          from './test_result/test_result_step.js';
import {TestRuns}                 from './test_run/test_run.js';
import {TestRunStages}            from './test_run/test_run_stage.js';
import {TestPlans}                from './test_plan/test_plan.js';
import {TestPlanItems}            from './test_plan/test_plan_item.js';
import {TestSystems}              from './test_system/test_system.js';
import {Users}                    from './users/users.js';

export const CollectionMaster = {
  Actions                 : Actions,
  CodeModules             : CodeModules,
  CodeModuleFunctions     : CodeModuleFunctions,
  CodeModuleFunctionParams: CodeModuleFunctionParams,
  Datastores              : Datastores,
  DatastoreDataTypes      : DatastoreDataTypes,
  DatastoreDataTypeFields : DatastoreDataTypeFields,
  DatastoreFields         : DatastoreFields,
  DatastoreRows           : DatastoreRows,
  DriverCommands          : DriverCommands,
  LogMessages             : LogMessages,
  Nodes                   : Nodes,
  Projects                : Projects,
  ProjectVersions         : ProjectVersions,
  ReferenceDocs           : ReferenceDocs,
  Screenshots             : Screenshots,
  TestServers             : TestServers,
  TestAgents              : TestAgents,
  TestCases               : TestCases,
  TestCaseRoles           : TestCaseRoles,
  TestCaseSteps           : TestCaseSteps,
  TestGroups              : TestGroups,
  TestResults             : TestResults,
  TestResultRoles         : TestResultRoles,
  TestResultSteps         : TestResultSteps,
  TestRuns                : TestRuns,
  TestRunStages           : TestRunStages,
  TestPlans               : TestPlans,
  TestPlanItems           : TestPlanItems,
  TestSystems             : TestSystems,
  Users                   : Users
};

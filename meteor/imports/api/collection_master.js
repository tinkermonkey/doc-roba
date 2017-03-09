// Import all of the collections
import {Actions}                  from './actions/actions.js';
import {CodeModules}              from './code_modules/code_modules.js';
import {CodeModuleFunctions}      from './code_modules/code_module_functions.js';
import {CodeModuleFunctionParams} from './code_modules/code_module_function_params.js';
import {Datastores}               from './datastores/datastores.js';
import {DatastoreDataTypes}       from './datastores/datastore_data_types.js';
import {DatastoreDataTypeFields}  from './datastores/datastore_data_type_fields.js';
import {DatastoreFields}          from './datastores/datastore_fields.js';
import {DatastoreRows}            from './datastores/datastore_rows.js';
import {DriverCommands}           from './driver_commands/driver_commands.js';
import {LogMessages}              from './log_messages/log_messages.js';
import {Nodes}                    from './nodes/nodes.js';
import {Projects}                 from './projects/projects.js';
import {ProjectVersions}          from './projects/project_versions.js';
import {ReferenceDocs}            from './reference_docs/reference_docs.js';
import {Screenshots}              from './screenshots/screenshots.js';
import {TestServers}              from './test_servers/test_servers.js';
import {TestAgents}               from './test_agents/test_agents.js';
import {TestCases}                from './test_cases/test_cases.js';
import {TestCaseRoles}            from './test_cases/test_case_roles.js';
import {TestCaseSteps}            from './test_cases/test_case_steps.js';
import {TestGroups}               from './test_cases/test_groups.js';
import {TestResults}              from './test_results/test_results.js';
import {TestResultRoles}          from './test_results/test_result_roles.js';
import {TestResultSteps}          from './test_results/test_result_steps.js';
import {TestRuns}                 from './test_runs/test_runs.js';
import {TestRunStages}            from './test_runs/test_run_stages.js';
import {TestPlans}                from './test_plans/test_plans.js';
import {TestPlanItems}            from './test_plans/test_plan_items.js';
import {TestSystems}              from './test_systems/test_systems.js';
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

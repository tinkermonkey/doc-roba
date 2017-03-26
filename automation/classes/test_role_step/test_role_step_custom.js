"use strict";

let _            = require('underscore'),
    logger       = require('../log_assistant.js').getLogger(),
    CodeExecutor = require('../code_executor/code_executor.js'),
    TestRoleStep = require('./test_role_step.js'),
    RobaError    = require('../roba_error.js');

class TestRoleStepCustom extends TestRoleStep {
  /**
   * Run the code provided
   */
  doStep () {
    logger.debug('TestRoleStepCustom.doStep:', this.index, this.record._id);
    let self         = this,
        driver       = self.testRole.driver,
        codeExecutor = new CodeExecutor(self.record.data.code),
        result;
    
    // Add the context variables to the code executor
    logger.debug("TestRoleStepCustom.doStep adding context variables", self.dataContext);
    codeExecutor.addVariable('driver', driver);
    _.keys(self.dataContext).forEach((key) => {
      codeExecutor.addVariable(key, self.dataContext[ key ]);
    });
    
    // Execute the code
    logger.debug("TestRoleStepCustom.doStep executing code:", self.record.data.code);
    result = codeExecutor.execute();
    driver.getClientLogs();
    logger.debug("TestRoleStepCustom.doStep result:", result);
    
    // The code should throw an exception if there is a problem
    if (result.error) {
      throw new RobaError(result.error);
    }
    return true;
  }
}

module.exports = TestRoleStepCustom;
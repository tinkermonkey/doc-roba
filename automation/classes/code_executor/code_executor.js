"use strict";

let logger = require('../log_assistant.js').getLogger();

class CodeExecutor {
  /**
   * CodeExecutor
   * @param code
   */
  constructor (code) {
    logger.debug("Creating code executor:", code);
    this.code      = code || '';
    this.variables = [];
  }
  
  /**
   * Execute the code
   */
  execute () {
    logger.debug("CodeExecutor executing:", this.code);
    let executor  = this,
        setupCode = 'var ',
        startTime = Date.now(),
        error, result;
    
    // Build up the variable context code
    setupCode += executor.variables.map(function (variable, index) {
          return variable.name + ' = executor.variables[' + index + '].value' + (variable.defaultValue ? ' || ' + variable.defaultValue : '')
        }).join(",\r\n    ") + ";\r\n";
    
    // Evaluate the code
    try {
      logger.debug("Executing code:", setupCode + executor.code);
      result = eval(setupCode + executor.code);
    } catch (e) {
      logger.error("Code execution failed:", e.toString(), e.stack);
      error = e;
    }
    
    // Return the result
    executor.executionTime = Date.now() - startTime;
    logger.debug("Code executed in [" + executor.executionTime + "] ms:", result);
    return {
      error : error,
      result: result
    }
  }
  
  /**
   * Add a variable
   * @param name
   * @param value
   * @param defaultValue
   */
  addVariable (name, value, defaultValue) {
    logger.debug("CodeExecutor adding variable:", name);
    this.variables.push({ name: name, value: value, defaultValue: defaultValue });
  }
}

module.exports = CodeExecutor;
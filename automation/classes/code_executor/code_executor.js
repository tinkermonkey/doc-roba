"use strict"

var log4js    = require('log4js'),
    logger    = log4js.getLogger('project'),
    advLogger = log4js.getLogger('adventure');

logger.setLevel('TRACE');

class CodeExecutor {
  /**
   * CodeExecutor
   * @param code
   */
  constructor (code) {
    advLogger.debug("Creating code executor:", code);
    this.code      = code || '';
    this.variables = [];
  }
  
  /**
   * Execute the code
   */
  execute () {
    advLogger.debug("CodeExecutor executing:", this.code);
    var executor  = this,
        setupCode = 'var ',
        startTime = Date.now(),
        error, result;
    
    // Build up the variable context code
    setupCode += executor.variables.map(function (variable, index) {
          return variable.name + ' = executor.variables[' + index + '].value' + (variable.defaultValue ? ' || ' + variable.defaultValue : '')
        }).join(",\r\n    ") + ";\r\n";
    
    // Evaluate the code
    try {
      advLogger.debug("Executing code:", setupCode + executor.code);
      result = eval(setupCode + executor.code);
    } catch (e) {
      advLogger.error("Code execution failed:", e.toString(), e.stack);
      error = e;
    }
    
    // Return the result
    executor.executionTime = Date.now() - startTime;
    advLogger.debug("Code executed in [" + executor.executionTime + "] ms:", result);
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
    advLogger.debug("CodeExecutor adding variable:", name);
    this.variables.push({ name: name, value: value, defaultValue: defaultValue });
  }
}

module.exports = CodeExecutor;
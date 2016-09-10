import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {FieldTypes} from './field_types.js';

/**
 * Datastore utility functions
 */
export const DSUtil = {
  /**
   * Get the stored schema definition for a field
   * @param field
   * @return Object
   */
  tableFieldDef(field) {
    return {
      label: field.title,
      type: field.type,
      dataKey: field.dataKey,
      dataTypeId: field.dataTypeId,
      fieldIsArray: field.fieldIsArray,
      defaultValue: field.defaultValue,
      schema: field.tableSchema()
    }
  },
  
  /**
   * Get the stored schema definition for a field
   * @param field
   * @return Object
   */
  simpleFieldDef(field) {
    return {
      label: field.title,
      type: DSUtil.dataTypeLiteral(field),
      optional: true
    }
  },
  
  /**
   * Get the data type literal for a field def
   * @param field
   */
  dataTypeLiteral(field) {
    //console.log("dataTypeLiteral:", field);
    var dataTypeLiteral;
    switch(field.type) {
      case FieldTypes.boolean:
        dataTypeLiteral = Boolean;
        break;
      case FieldTypes.custom:
        dataTypeLiteral = field.dataType().simpleSchema();
        break;
      case FieldTypes.date:
        dataTypeLiteral = Date;
        break;
      case FieldTypes.number:
        dataTypeLiteral = Number;
        break;
      case FieldTypes.string:
        dataTypeLiteral = String;
        break;
    }
  
    if(field.fieldIsArray){
      return [dataTypeLiteral]
    } else {
      return dataTypeLiteral
    }
  }
};
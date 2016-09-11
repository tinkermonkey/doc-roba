import { PlatformTypes } from './platform_types.js';

/**
 * Base class for platform types
 */
export class PlatformType {
  /**
   * PlatformType
   * @return {PlatformType}
   */
  constructor (type) {
    if (!(type !== undefined && _.contains(_.values(PlatformTypes), type))) {
      throw new Error('invalid-platform-type');
    }
    
    this.type = type;
  }
  
  /**
   * NodeComparitor setter/getter
   * @param comparitor
   */
  nodeComparitor (comparitor) {
    if (comparitor) {
      this.comparitor = comparitor;
      return this;
    } else {
      return this.comparitor
    }
  }
  
  /**
   * Adventure Assistant setter/getter
   * @param assistant
   */
  adventureAssistant (assistant) {
    if (assistant) {
      this.assistant = assistant;
      return this
    } else {
      return this.assistant
    }
  }
  
  /**
   * Edit panel params template setter/getter
   * @param templateName
   */
  nodeEditParamsTemplate (templateName) {
    if (templateName) {
      this.nodeEditParamsTemplateName = templateName;
      return this
    } else {
      return this.nodeEditParamsTemplateName
    }
  }
  
  /**
   * Edit panel tabs template setter/getter
   * @param templateName
   */
  nodeEditTabsTemplate (templateName) {
    if (templateName) {
      this.nodeEditTabsTemplateName = templateName;
      return this
    } else {
      return this.nodeEditTabsTemplateName
    }
  }
  
  /**
   * Edit panel tabs template setter/getter
   * @param templateName
   */
  adventureAddNodeTemplate (templateName) {
    if (templateName) {
      this.adventureAddNodeTemplateName = templateName;
      return this
    } else {
      return this.adventureAddNodeTemplateName
    }
  }
  
  /**
   * Edit panel tabs template setter/getter
   * @param templateName
   */
  nodeSearchComparisonTemplate (templateName) {
    if (templateName) {
      this.nodeSearchComparisonTemplateName = templateName;
      return this
    } else {
      return this.nodeSearchComparisonTemplateName
    }
  }
}
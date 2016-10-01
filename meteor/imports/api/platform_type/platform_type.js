import { PlatformTypes } from './platform_types.js';
import { PlatformOperatingSystems } from '../../../imports/api/platform_configuration/platform_operating_system.js';
import { PlatformViewports } from '../../../imports/api/platform_configuration/platform_viewport.js';

/**
 * Base class for platform types
 */
export class PlatformType {
  /**
   * PlatformType
   * @param type PlatformTypes key for this platform type
   * @param config Platform type configuration
   * @return {PlatformType}
   */
  constructor (type, config) {
    if (!(type !== undefined && _.contains(_.values(PlatformTypes), type))) {
      throw new Error('invalid-platform-type');
    }
    
    this.type      = type;
    this.templates = {};
    
    /*
     config template:
     {
     comparitor: NodeComparitor,
     assistant: AdventureAssistant,
     templates: {
     nodeEditDetails: '',
     nodeEditTabs: '',
     addNode: '',
     nodeSearchComparison: '',
     }
     
     }
     */
    
    // Node comparitor
    this.comparitor = config.comparitor;
    
    // Adventure assistant
    this.assistant = config.assistant;
    
    // Node edit details template
    this.templates.nodeEditDetails = config.templates.nodeEditDetails;
    
    // Node edit tabs template
    this.templates.nodeEditTabs = config.templates.nodeEditTabs;
    
    // Adventure add node template
    this.templates.addNode = config.templates.addNode;
    
    // Node search comparison template
    this.templates.nodeSearchComparison = config.templates.nodeSearchComparison;
    
    // Default platform config creator
    this.defaultConfig = config.defaultConfig;
  }
  
  /**
   * Configure the default data for this platform
   * @param platformConfig PlatformConfig
   */
  configurePlatformDefaults (platformConfig) {
    console.log("PlatformType.defaultPlatformConfig:", this.type, platformConfig);
    let defaultConfig = this.defaultConfig;
    if (platformConfig) {
      // Setup the default viewports
      if (defaultConfig && defaultConfig.viewports) {
        defaultConfig.viewports.forEach((viewport) => {
          console.log("PlatformType.defaultPlatformConfig: inserting viewport [", viewport.title, "]");
          viewport.projectId        = platformConfig.projectId;
          viewport.projectVersionId = platformConfig.projectVersionId;
          viewport.platformId       = platformConfig._id;
          PlatformViewports.insert(viewport);
        });
      }
      
      // Setup the default OSes
      if (defaultConfig && defaultConfig.operatingSystems) {
        defaultConfig.operatingSystems.forEach((os) => {
          console.log("PlatformType.defaultPlatformConfig: inserting operating system [", os.title, "]");
          os.projectId        = platformConfig.projectId;
          os.projectVersionId = platformConfig.projectVersionId;
          os.platformId       = platformConfig._id;
          PlatformOperatingSystems.insert(os);
        });
      }
    } else {
      console.error("PlatformType.defaultPlatformConfig: no platformConfig specified");
    }
  }
}
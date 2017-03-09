import { PlatformType } from '../../api/platform_type/platform_type.js';
import { PlatformTypes } from '../../api/platform_type/platform_types.js';
import { WebNodeComparitor } from '../web/api/web_node_comparitor.js';
import { WebAdventureAssistant } from '../web/api/web_adventure_assistant.js';

// Default Viewports
let defaultViewports        = [
      {
        title: '1024 x 768',
        width: 1024,
        height: 768
      }
    ],
    defaultOperatingSystems = [
      {
        title: 'iOS',
        versions: [
          '10',
          '8.1',
          '8',
          '7'
        ],
        iconCss: 'icon-windows8'
      },{
        title: 'Android',
        versions: [
          '10.12',
          '10.11',
          '10.10',
          '10.9'
        ],
        iconCss: 'icon-finder'
      }
    ];

export const MobileAppPlatformType = new PlatformType(PlatformTypes.mobileApp, {
      comparitor: new WebNodeComparitor(),
      assistant : new WebAdventureAssistant(),
      templates : {
        nodeEditDetails     : 'WebNodeEditParams',
        nodeEditTabs        : '',
        addNode             : 'WebAdventureAddNode',
        nodeSearchComparison: 'WebSearchComparisonResults',
      },
      defaultConfig: {
        viewports: defaultViewports,
        operatingSystems: defaultOperatingSystems
      }
    }
);

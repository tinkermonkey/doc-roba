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
      },{
        title: '1280 x 1024',
        width: 1280,
        height: 1024
      },{
        title: '1366 x 768',
        width: 1366,
        height: 768
      },{
        title: '1440 x 900',
        width: 1440,
        height: 900
      },{
        title: '1600 x 900',
        width: 1600,
        height: 900,
        default: true
      },{
        title: '1920 x 1080',
        width: 1920,
        height: 1080
      },{
        title: '2560 x 1600',
        width: 2560,
        height: 1600
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

export const MobileWebPlatformType = new PlatformType(PlatformTypes.mobileWeb, {
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

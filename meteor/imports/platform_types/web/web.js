import { PlatformType } from '../../api/platform_type/platform_type.js';
import { PlatformTypes } from '../../api/platform_type/platform_types.js';
import { WebNodeComparitor } from './api/web_node_comparitor.js';
import { WebAdventureAssistant } from './api/web_adventure_assistant.js';

export const WebPlatformType = new PlatformType(PlatformTypes.web);

// Set the web comparitor
WebPlatformType.nodeComparitor(new WebNodeComparitor());

// Set the web Adventure Assistant
WebPlatformType.adventureAssistant(new WebAdventureAssistant());

// Set the edit node templates
WebPlatformType.nodeEditParamsTemplate("WebNodeEditParams");
WebPlatformType.adventureAddNodeTemplate("WebAdventureAddNode");
WebPlatformType.nodeSearchComparisonTemplate("WebSearchComparisonResults");
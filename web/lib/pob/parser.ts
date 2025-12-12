/**
 * PoB XML Parser
 *
 * Parses PoB XML into typed domain models.
 * Security: Validates structure, sanitizes data, handles malformed XML gracefully.
 */

import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Build, PassiveTreeSpec, ItemSet, SkillSet } from '@/lib/domain';

// Parser configuration with security settings
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  // Security: limit entity expansion to prevent billion laughs attack
  processEntities: false,
  stopNodes: ['*.script'], // Never parse script tags
};

export type ParseError =
  | { type: 'MALFORMED_XML'; message: string; location?: string }
  | { type: 'MISSING_REQUIRED_FIELD'; field: string }
  | { type: 'UNSUPPORTED_VERSION'; version: string }
  | { type: 'UNKNOWN'; message: string };

export type ParseResult =
  | {
      success: true;
      build: Build;
    }
  | {
      success: false;
      error: ParseError;
    };

/**
 * Parses PoB XML into a typed Build model
 *
 * @param xml - The decoded PoB XML string
 * @returns ParseResult with Build object or error
 *
 * @example
 * const result = parsePobXml(xmlString);
 * if (result.success) {
 *   console.log(result.build.className);
 * }
 */
export function parsePobXml(xml: string): ParseResult {
  try {
    // Step 1: Validate XML structure
    const validationResult = XMLValidator.validate(xml, {
      allowBooleanAttributes: true,
    });

    if (validationResult !== true) {
      return {
        success: false,
        error: {
          type: 'MALFORMED_XML',
          message: `XML validation failed: ${validationResult.err.msg}`,
          location: `Line ${validationResult.err.line}`,
        },
      };
    }

    // Step 2: Parse XML
    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xml);

    // Step 3: Validate root element (PoE1 uses PathOfBuilding, PoE2 uses PathOfBuilding2)
    const pob = parsed.PathOfBuilding2 || parsed.PathOfBuilding;
    if (!pob) {
      return {
        success: false,
        error: {
          type: 'MALFORMED_XML',
          message: 'Missing PathOfBuilding/PathOfBuilding2 root element',
        },
      };
    }

    // Step 4: Extract and validate Build section
    // Allow empty Build element
    const buildData = pob.Build ?? {};

    // Extract basic metadata
    const level = Number(buildData['@_level']) || 1;
    const className = buildData['@_className'] || 'Witch';
    const ascendancy = buildData['@_ascendClassName'] || null;
    const version = buildData['@_targetVersion'] || '3_0';
    const characterName = buildData['@_characterName'] || 'Unnamed Build';

    // Step 5: Parse passive tree
    const passiveTree = parsePassiveTree(pob.Tree);

    // Step 6: Parse items
    const items = parseItems(pob.Items);

    // Step 7: Parse skills
    const skills = parseSkills(pob.Skills);

    // Step 8: Parse config
    const config = parseConfig(pob.Config);

    // Step 9: Construct Build object
    const build: Build = {
      id: generateBuildId(),
      name: characterName,
      level,
      className: className as Build['className'],
      ascendancy,
      version,
      passiveTree,
      items,
      skills,
      config,
      source: {
        pobCode: '', // Will be set by caller
        importedAt: new Date(),
      },
    };

    return {
      success: true,
      build,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return {
      success: false,
      error: {
        type: 'UNKNOWN',
        message: `Failed to parse XML: ${errorMessage}`,
      },
    };
  }
}

/**
 * Parses passive tree data from XML
 */
export function parsePassiveTree(treeData: unknown): PassiveTreeSpec {
  if (!treeData || typeof treeData !== 'object' || !('Spec' in treeData)) {
    return {
      version: '3_21',
      allocatedNodes: new Set(),
      masterySelections: new Map(),
      jewelSockets: [],
      totalPoints: 0,
      ascendancyPoints: 0,
    };
  }

  const data = treeData as Record<string, unknown>;

  // Handle both single spec and array of specs
  const specs = Array.isArray(data.Spec) ? data.Spec : [data.Spec];
  const activeSpecId = Number(data['@_activeSpec']) || 1;
  const activeSpec =
    specs.find((s: { '@_id'?: number }) => Number(s['@_id'] || 1) === activeSpecId) || specs[0];

  if (!activeSpec) {
    return {
      version: '3_21',
      allocatedNodes: new Set(),
      masterySelections: new Map(),
      jewelSockets: [],
      totalPoints: 0,
      ascendancyPoints: 0,
    };
  }

  // Parse allocated nodes
  const nodesStr = activeSpec['@_nodes'] || '';
  const allocatedNodes: Set<number> = new Set(
    String(nodesStr)
      .split(',')
      .map((n) => Number(n.trim()))
      .filter((n) => !isNaN(n) && n > 0)
  );

  // Parse mastery selections (if present)
  const masterySelections = new Map<number, number>();
  // TODO: Parse mastery data when available in XML

  // Parse jewel sockets
  const jewelSockets: PassiveTreeSpec['jewelSockets'] = [];
  if (activeSpec.Sockets && activeSpec.Sockets.Socket) {
    const sockets = Array.isArray(activeSpec.Sockets.Socket)
      ? activeSpec.Sockets.Socket
      : [activeSpec.Sockets.Socket];

    for (const socket of sockets) {
      const nodeId = Number(socket['@_nodeId']);
      const itemId = Number(socket['@_itemId']) || null;
      if (!isNaN(nodeId)) {
        jewelSockets.push({ nodeId, itemId });
      }
    }
  }

  const version = activeSpec['@_treeVersion'] || '3_21';

  return {
    version,
    allocatedNodes,
    masterySelections,
    jewelSockets,
    totalPoints: allocatedNodes.size,
    ascendancyPoints: 0, // TODO: Calculate from ascendancy nodes
  };
}

/**
 * Parses items from XML
 */
export function parseItems(itemsData: unknown): ItemSet {
  const itemSet: ItemSet = {
    activeSet: 1,
    slots: new Map(),
  };

  if (!itemsData || typeof itemsData !== 'object') {
    return itemSet;
  }

  const data = itemsData as Record<string, unknown>;
  itemSet.activeSet = Number(data['@_activeItemSet']) || 1;

  // For Phase 1, we'll create a minimal item structure
  // Full item parsing will be implemented in subsequent phases
  // TODO: Parse actual items from XML

  return itemSet;
}

/**
 * Parses skills from XML
 */
export function parseSkills(skillsData: unknown): SkillSet {
  const skillSet: SkillSet = {
    activeSet: 1,
    skillGroups: [],
  };

  if (!skillsData || typeof skillsData !== 'object') {
    return skillSet;
  }

  const data = skillsData as Record<string, unknown>;
  skillSet.activeSet = Number(data['@_activeSkillSet']) || 1;

  // For Phase 1, we'll create a minimal skill structure
  // Full skill parsing will be implemented in subsequent phases
  // TODO: Parse actual skills from XML

  return skillSet;
}

/**
 * Parses configuration from XML
 */
export function parseConfig(configData: unknown): Build['config'] {
  const config: Build['config'] = {
    customConfig: {},
  };

  if (!configData || typeof configData !== 'object' || !('Input' in configData)) {
    return config;
  }

  const data = configData as Record<string, unknown>;
  const inputs = Array.isArray(data.Input) ? data.Input : [data.Input];

  for (const input of inputs) {
    const name = input['@_name'];
    if (!name) continue;

    // Parse different value types
    let value: string | number | boolean | undefined;

    if (input['@_boolean'] !== undefined) {
      value = input['@_boolean'] === 'true' || input['@_boolean'] === true;
    } else if (input['@_number'] !== undefined) {
      value = Number(input['@_number']);
    } else if (input['@_string'] !== undefined) {
      value = String(input['@_string']);
    }

    if (value !== undefined) {
      // Map known config keys
      switch (name) {
        case 'enemyLevel':
          config.enemyLevel = value as number;
          break;
        case 'enemyIsBoss':
          config.enemyIsBoss = value as boolean;
          break;
        case 'usePowerCharges':
          config.usePowerCharges = value as boolean;
          break;
        case 'useFrenzyCharges':
          config.useFrenzyCharges = value as boolean;
          break;
        case 'useEnduranceCharges':
          config.useEnduranceCharges = value as boolean;
          break;
        case 'resistancePenalty':
          config.resistancePenalty = value as number;
          break;
        default:
          // Store unknown config in customConfig
          if (config.customConfig) {
            config.customConfig[name] = value;
          }
      }
    }
  }

  return config;
}

/**
 * Generates a unique build ID
 */
function generateBuildId(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

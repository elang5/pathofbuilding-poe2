/**
 * Passive tree domain models
 */

import type { StatMod } from './stats';

export interface PassiveTreeSpec {
  version: string; // Tree version (patches change the tree)
  allocatedNodes: Set<number>; // Node IDs that are allocated
  masterySelections: Map<number, number>; // Mastery node → selected option
  jewelSockets: JewelSocket[];
  totalPoints: number;
  ascendancyPoints: number;
}

export interface JewelSocket {
  nodeId: number;
  itemId: number | null;
  radius?: JewelRadius;
}

export type JewelRadius = 'Small' | 'Medium' | 'Large';

export type NodeType =
  | 'Normal'
  | 'Notable'
  | 'Keystone'
  | 'Mastery'
  | 'JewelSocket'
  | 'AscendancyStart'
  | 'AscendancyNormal'
  | 'AscendancyNotable';

export interface PassiveNode {
  id: number;
  name: string;
  type: NodeType;
  stats: StatMod[];
  position: { x: number; y: number };
  connections: number[];
  ascendancyName?: string;
  isKeystone?: boolean;
  isNotable?: boolean;
  isMastery?: boolean;
  masteryOptions?: MasteryOption[];
}

export interface MasteryOption {
  id: number;
  stats: StatMod[];
}

/**
 * Skill and gem domain models
 */

import type { GemTag, ItemSlot } from './types';
import type { StatMod } from './stats';

export interface SkillSet {
  activeSet: number;
  skillGroups: SkillGroup[];
}

export interface SkillGroup {
  id: number;
  slot: ItemSlot | null; // Where gems are socketed
  enabled: boolean;
  mainActiveSkillIndex: number; // Which skill in group is "main"
  gems: GemInstance[];
}

export interface GemInstance {
  gemId: string; // Internal game ID
  name: string;
  level: number;
  quality: number;
  enabled: boolean;
  isSupport: boolean;

  // Parsed gem data
  tags: GemTag[];
  stats: StatMod[];

  // Support-specific
  supportedTypes?: GemTag[]; // What skill types this supports
}

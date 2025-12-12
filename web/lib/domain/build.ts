/**
 * Build aggregate root - ties together all build components
 */

import type { Ascendancy, ClassName } from './types';
import type { PassiveTreeSpec } from './passive-tree';
import type { ItemSet } from './item';
import type { SkillSet } from './skill';
import type { CalculatedStats } from './stats';

export interface Build {
  // Metadata
  id: string; // Generated UUID for local storage
  name: string;
  level: number;
  className: ClassName;
  ascendancy: Ascendancy | null;
  version: string; // PoB/game version

  // Core components
  passiveTree: PassiveTreeSpec;
  items: ItemSet;
  skills: SkillSet;
  config: BuildConfig;

  // Calculated stats (populated by analyzer)
  stats?: CalculatedStats;

  // Source
  source: {
    pobCode: string; // Original import code
    importedAt: Date;
  };
}

export interface BuildConfig {
  // Enemy configuration
  enemyLevel?: number;
  enemyIsBoss?: boolean;
  bossTier?: 'Normal' | 'Pinnacle';

  // Character state
  usePowerCharges?: boolean;
  useFrenzyCharges?: boolean;
  useEnduranceCharges?: boolean;

  // Conditions
  onConsecratedGround?: boolean;
  enemyIsFrozen?: boolean;
  enemyIsShocked?: boolean;
  enemyIsBurning?: boolean;

  // Resistances
  resistancePenalty?: number;

  // Custom config entries (key-value pairs from PoB)
  customConfig?: Record<string, string | number | boolean>;
}

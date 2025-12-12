/**
 * Stat modification and calculation models
 */

import type { ModCondition, ModType } from './types';

export interface StatMod {
  stat: string; // Stat identifier
  value: number;
  type: ModType;
  conditions?: ModCondition[];
}

export interface CalculatedStats {
  // Offense
  damage: DamageStats;

  // Defense
  defense: DefenseStats;

  // Resources
  resources: ResourceStats;

  // Misc
  attributes: AttributeStats;
  charges: ChargeStats;
}

export interface DamageStats {
  // Per-skill breakdown
  skills: Map<string, SkillDamageStats>;

  // Main skill summary
  mainSkill: SkillDamageStats;
}

export interface SkillDamageStats {
  totalDps: number;

  // Damage composition
  physicalDps: number;
  fireDps: number;
  coldDps: number;
  lightningDps: number;
  chaosDps: number;

  // Hit vs DoT
  hitDps: number;
  dotDps: number;

  // Breakdown
  averageHit: number;
  hitRate: number; // Hits per second
  critChance: number;
  critMultiplier: number;

  // Scaling factors (for analysis)
  damageMultipliers: DamageMultiplier[];
}

export interface DamageMultiplier {
  name: string;
  value: number; // e.g., 1.5 = 50% more
  type: 'more' | 'increased' | 'base';
  source: string; // Where it comes from
}

export interface DefenseStats {
  // EHP
  effectiveHitPool: number;

  // Life/ES/Ward
  life: number;
  energyShield: number;
  ward: number;

  // Mitigation
  armour: number;
  evasion: number;
  physicalDamageReduction: number;

  // Elemental
  fireResistance: number;
  coldResistance: number;
  lightningResistance: number;
  chaosResistance: number;

  // Avoidance
  blockChance: number;
  spellBlockChance: number;
  dodgeChance: number;
  spellDodgeChance: number;
  spellSuppression: number;

  // Recovery
  lifeRegen: number;
  energyShieldRegen: number;
  lifeLeech: number;

  // Layers (for analysis)
  defenseLayers: DefenseLayer[];
}

export interface DefenseLayer {
  name: string;
  type: 'avoidance' | 'mitigation' | 'recovery' | 'ehp';
  value: number;
  effectiveness: number; // 0-1 scale
  description: string;
}

export interface ResourceStats {
  mana: number;
  manaRegen: number;
  manaReserved: number;
  manaUnreserved: number;

  rage?: number;
  spiritReserved?: number;
}

export interface AttributeStats {
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface ChargeStats {
  power: { current: number; max: number };
  frenzy: { current: number; max: number };
  endurance: { current: number; max: number };
}

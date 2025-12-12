/**
 * Meta Knowledge Base
 *
 * Curated data about the current PoE2 meta, build archetypes, and best practices.
 * This data is used by the coaching engine to provide recommendations.
 *
 * Data sources:
 * - poe.ninja build statistics (December 2025)
 * - Maxroll.gg build meta analysis
 * - Community build databases (Mobalytics, Maxroll)
 *
 * Updated: December 2025 (Patch 0.3.x)
 */

import type { ClassName } from '../domain/types';

export type MetaTier = 'S' | 'A' | 'B' | 'C' | 'D';
export type PlayStyle = 'ranged' | 'melee' | 'spellcaster' | 'minion' | 'hybrid';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Build Archetype - represents a meta build pattern
 */
export interface BuildArchetype {
  id: string;
  name: string;
  description: string;
  className: ClassName;
  ascendancy: string;
  tier: MetaTier;
  playStyle: PlayStyle;
  difficulty: DifficultyLevel;

  // Popularity metrics (from poe.ninja)
  popularity: number; // percentage of players (0-100)

  // Core build components
  primarySkills: string[];
  secondarySkills: string[];
  keyPassiveNodes: string[];
  keyKeystones: string[];

  // Strengths and weaknesses
  strengths: string[];
  weaknesses: string[];

  // Requirements
  levelRequirement: number;
  budgetTier: 'low' | 'medium' | 'high';

  // Performance metrics
  clearSpeed: number; // 1-10
  bossing: number; // 1-10
  survivability: number; // 1-10

  // Learning resources
  guideUrl?: string;
  videoUrl?: string;
}

/**
 * Meta knowledge for specific skills
 */
export interface SkillMetaData {
  name: string;
  usage: number; // percentage of builds using this skill
  tier: MetaTier;
  synergies: string[]; // Skills that work well with this
  counterSynergies: string[]; // Skills that don't work well with this
  recommendedSupports: string[];
}

/**
 * Meta knowledge for passive keystones
 */
export interface KeystoneMetaData {
  name: string;
  nodeId: number;
  usage: number;
  tier: MetaTier;
  description: string;
  bestFor: string[]; // Build archetypes that benefit most
  conflicts: string[]; // Keystones that conflict with this
}

/**
 * Current meta archetypes (December 2025)
 * Data sourced from poe.ninja and Maxroll
 */
export const META_ARCHETYPES: BuildArchetype[] = [
  {
    id: 'deadeye-lightning-arrow',
    name: 'Deadeye Lightning Arrow',
    description:
      'The dominant meta build with exceptional clear speed and boss damage. Uses Lightning Arrow for fast projectile clearing.',
    className: 'Ranger',
    ascendancy: 'Deadeye',
    tier: 'S',
    playStyle: 'ranged',
    difficulty: 'beginner',
    popularity: 32, // 32% of top players
    primarySkills: ['Lightning Arrow', 'Barrage'],
    secondarySkills: ['Blink', 'Herald of Thunder'],
    keyPassiveNodes: ['Projectile Damage', 'Critical Strike Chance', 'Life'],
    keyKeystones: ['Point Blank', 'Avatar of the Hunt'],
    strengths: [
      'Exceptional clear speed',
      'Strong boss damage',
      'Great league starter',
      'Scales well with investment',
    ],
    weaknesses: ['Requires positioning', 'Can be squishy without investment'],
    levelRequirement: 1,
    budgetTier: 'low',
    clearSpeed: 10,
    bossing: 9,
    survivability: 6,
    guideUrl: 'https://maxroll.gg/poe2/build-guides',
  },
  {
    id: 'blood-mage-fireball',
    name: 'Blood Mage Fireball',
    description:
      'Dominant endgame spellcaster using Fireball for massive AoE damage. Excellent scaling potential.',
    className: 'Witch',
    ascendancy: 'Blood Mage',
    tier: 'S',
    playStyle: 'spellcaster',
    difficulty: 'intermediate',
    popularity: 25,
    primarySkills: ['Fireball', 'Ember Fusillade'],
    secondarySkills: ['Flame Wall', 'Flammability'],
    keyPassiveNodes: ['Spell Damage', 'Fire Damage', 'Critical Strike Multiplier'],
    keyKeystones: ['Blood Magic', 'Elemental Overload'],
    strengths: [
      'Unmatched endgame scaling',
      'Massive AoE damage',
      'Great boss damage',
      'Flexible gearing',
    ],
    weaknesses: ['Slower early game', 'Mana management required', 'Positioning critical'],
    levelRequirement: 12,
    budgetTier: 'medium',
    clearSpeed: 9,
    bossing: 10,
    survivability: 7,
  },
  {
    id: 'lich-spellcaster',
    name: 'Lich Spellcaster',
    description:
      'Versatile spellcaster ascendancy with exceptional defensive capabilities and flexible skill choices.',
    className: 'Witch',
    ascendancy: 'Lich',
    tier: 'S',
    playStyle: 'spellcaster',
    difficulty: 'intermediate',
    popularity: 18,
    primarySkills: ['Spark', 'Freezing Pulse', 'Bone Blast'],
    secondarySkills: ['Bone Offering', 'Enfeeble'],
    keyPassiveNodes: ['Spell Damage', 'Energy Shield', 'Minion Damage'],
    keyKeystones: ['Chaos Inoculation', 'Minion Instability'],
    strengths: ['Excellent defenses', 'Versatile skill options', 'Good sustain', 'Strong scaling'],
    weaknesses: ['Requires good gear for endgame', 'Complex mechanics'],
    levelRequirement: 12,
    budgetTier: 'medium',
    clearSpeed: 8,
    bossing: 8,
    survivability: 9,
  },
  {
    id: 'necromancer-minions',
    name: 'Necromancer Minion Army',
    description:
      'Summon-focused build with strong minions. Buffed in patch 0.3, now highly viable.',
    className: 'Witch',
    ascendancy: 'Necromancer',
    tier: 'A',
    playStyle: 'minion',
    difficulty: 'beginner',
    popularity: 12,
    primarySkills: ['Raise Zombie', 'Summon Skeleton', 'Summon Raging Spirit'],
    secondarySkills: ['Bone Offering', 'Flesh Offering'],
    keyPassiveNodes: ['Minion Damage', 'Minion Life', 'Minion Speed'],
    keyKeystones: ['Commander of Darkness', 'Mistress of Sacrifice'],
    strengths: [
      'Safe playstyle',
      'Great for beginners',
      'Recently buffed (0.3)',
      'Low budget friendly',
    ],
    weaknesses: ['Slower clear than projectile builds', 'Minion AI can be clunky'],
    levelRequirement: 1,
    budgetTier: 'low',
    clearSpeed: 7,
    bossing: 8,
    survivability: 9,
  },
  {
    id: 'invoker-hollow-palm',
    name: 'Invoker Hollow Palm',
    description: 'New unarmed playstyle using Hollow Palm keystone. Rising in popularity.',
    className: 'Monk',
    ascendancy: 'Invoker',
    tier: 'A',
    playStyle: 'melee',
    difficulty: 'advanced',
    popularity: 8,
    primarySkills: ['Falling Thunder', 'Tempest Bell'],
    secondarySkills: ['Herald of Ice', 'Clarity'],
    keyPassiveNodes: ['Unarmed Damage', 'Attack Speed', 'Evasion'],
    keyKeystones: ['Hollow Palm Technique', 'Acrobatics'],
    strengths: ['Unique playstyle', 'High attack speed', 'Good mobility', 'Satisfying mechanics'],
    weaknesses: ['Requires specific keystone', 'Limited weapon options', 'Needs good positioning'],
    levelRequirement: 28,
    budgetTier: 'medium',
    clearSpeed: 8,
    bossing: 7,
    survivability: 7,
  },
  {
    id: 'titan-boneshatter',
    name: 'Titan Boneshatter',
    description: 'Powerful melee build with high damage and sustain.',
    className: 'Warrior',
    ascendancy: 'Titan',
    tier: 'A',
    playStyle: 'melee',
    difficulty: 'intermediate',
    popularity: 10,
    primarySkills: ['Boneshatter', 'Earthquake'],
    secondarySkills: ['Ancestral Totem', 'Enduring Cry'],
    keyPassiveNodes: ['Physical Damage', 'Life', 'Armour'],
    keyKeystones: ['Resolute Technique', 'Unwavering Stance'],
    strengths: ['High sustain', 'Tanky', 'Strong boss damage', 'Satisfying gameplay'],
    weaknesses: ['Slower clear speed', 'Melee range limitations', 'Self-damage mechanic'],
    levelRequirement: 12,
    budgetTier: 'low',
    clearSpeed: 6,
    bossing: 9,
    survivability: 10,
  },
];

/**
 * Get archetype by class and ascendancy
 */
export function getArchetypeByClass(className: ClassName, ascendancy?: string): BuildArchetype[] {
  return META_ARCHETYPES.filter(
    (arch) => arch.className === className && (!ascendancy || arch.ascendancy === ascendancy)
  );
}

/**
 * Get top-tier archetypes
 */
export function getTopTierArchetypes(tier: MetaTier = 'S'): BuildArchetype[] {
  return META_ARCHETYPES.filter((arch) => arch.tier === tier);
}

/**
 * Get archetypes by difficulty
 */
export function getArchetypesByDifficulty(difficulty: DifficultyLevel): BuildArchetype[] {
  return META_ARCHETYPES.filter((arch) => arch.difficulty === difficulty);
}

/**
 * Get beginner-friendly archetypes
 */
export function getBeginnerArchetypes(): BuildArchetype[] {
  return META_ARCHETYPES.filter(
    (arch) => arch.difficulty === 'beginner' && arch.budgetTier === 'low'
  ).sort((a, b) => b.popularity - a.popularity);
}

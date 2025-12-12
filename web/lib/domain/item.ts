/**
 * Item domain models
 */

import type { DamageRange, ElementalDamage, ItemSlot } from './types';
import type { StatMod } from './stats';

// Re-export ItemSlot from types for convenience
export type { ItemSlot };

export type ItemRarity = 'Normal' | 'Magic' | 'Rare' | 'Unique';

export type ItemClass =
  | 'Weapon'
  | 'Body Armour'
  | 'Helmet'
  | 'Gloves'
  | 'Boots'
  | 'Belt'
  | 'Ring'
  | 'Amulet'
  | 'Shield'
  | 'Quiver'
  | 'Flask'
  | 'Jewel';

export interface Item {
  id: number;
  name: string;
  baseName: string;
  rarity: ItemRarity;
  itemClass: ItemClass;
  requirements: ItemRequirements;

  // Stats
  implicitMods: ItemMod[];
  explicitMods: ItemMod[];
  craftedMods: ItemMod[];
  enchantMods: ItemMod[];

  // Sockets (for skill gems)
  sockets?: Socket[];

  // Weapon-specific
  weaponStats?: WeaponStats;

  // Armour-specific
  armourStats?: ArmourStats;

  // State
  corrupted: boolean;
  mirrored: boolean;
  quality: number;

  // Raw text for display
  rawText: string;
}

export interface ItemRequirements {
  level?: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
}

export interface ItemMod {
  text: string; // Display text
  stats: StatMod[]; // Parsed stat effects
  tier?: number; // Mod tier if known
}

export interface Socket {
  group: number;
  attr: 'S' | 'D' | 'I' | 'G'; // Strength, Dexterity, Intelligence, Generic
}

export interface WeaponStats {
  physicalDamage: DamageRange;
  elementalDamage: ElementalDamage[];
  criticalChance: number;
  attacksPerSecond: number;
  range?: number;
}

export interface ArmourStats {
  armour?: number;
  evasion?: number;
  energyShield?: number;
  ward?: number;
}

export interface ItemSet {
  activeSet: number;
  slots: Map<ItemSlot, Item | null>;
}

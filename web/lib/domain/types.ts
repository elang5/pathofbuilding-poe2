/**
 * Shared type definitions for the PoE2 Build Coach domain
 */

export type ClassName =
  | 'Warrior'
  | 'Ranger'
  | 'Witch'
  | 'Duelist'
  | 'Marauder'
  | 'Shadow'
  | 'Monk'
  | 'Sorceress'
  | 'Mercenary'
  | 'Huntress'
  | 'Druid'
  | 'Templar';

export type Ascendancy = string; // Class-specific, validated separately

export type DamageType = 'Physical' | 'Fire' | 'Cold' | 'Lightning' | 'Chaos';

export type GemTag =
  | 'Attack'
  | 'Spell'
  | 'Minion'
  | 'Aura'
  | 'Curse'
  | 'Movement'
  | 'Projectile'
  | 'AoE'
  | 'Duration'
  | 'Channelling'
  | 'Melee'
  | 'Strike'
  | 'Bow'
  | 'Wand'
  | 'Totem'
  | 'Trap'
  | 'Mine'
  | 'Brand'
  | 'Link' // PoE2 specific
  | 'Meta'; // Meta gems (PoE2)

export type ModType =
  | 'Base' // Flat addition to base
  | 'Increased' // Additive % increase
  | 'More' // Multiplicative % increase
  | 'Override'; // Replaces value entirely

export interface ModCondition {
  type: string;
  value: string | number | boolean;
}

export interface DamageRange {
  min: number;
  max: number;
}

export interface ElementalDamage {
  type: DamageType;
  min: number;
  max: number;
}

export type ItemSlot =
  | 'Weapon 1'
  | 'Weapon 2'
  | 'Weapon 1 Swap'
  | 'Weapon 2 Swap'
  | 'Helmet'
  | 'Body Armour'
  | 'Gloves'
  | 'Boots'
  | 'Belt'
  | 'Amulet'
  | 'Ring 1'
  | 'Ring 2'
  | 'Flask 1'
  | 'Flask 2'
  | 'Flask 3'
  | 'Flask 4'
  | 'Flask 5';

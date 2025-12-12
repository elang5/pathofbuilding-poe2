/**
 * Damage Analysis Module
 *
 * Analyzes how damage scales through the calculation pipeline:
 * Base → Flat → Increased → More → Crit → Speed → DPS
 */

import type { Build } from '../domain/build';

export interface DamageAnalysis {
  totalDps: number;

  // Scaling breakdown
  scalingBreakdown: ScalingStep[];

  // Biggest contributors
  topContributors: DamageContributor[];

  // Opportunities
  scalingOpportunities: ScalingOpportunity[];

  // Educational content
  explanation: string;
}

export interface ScalingStep {
  name: string;
  category: 'base' | 'flat' | 'increased' | 'more' | 'crit' | 'speed';
  beforeValue: number;
  afterValue: number;
  multiplier: number;
  sources: string[];
  explanation: string;
}

export interface DamageContributor {
  name: string;
  source: 'item' | 'passive' | 'gem' | 'config';
  contribution: number; // DPS added
  percentage: number; // % of total
}

export interface ScalingOpportunity {
  category: string;
  currentValue: number;
  potentialGain: number;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestions: string[];
}

/**
 * Analyzes damage scaling for a build
 */
export function analyzeDamage(build: Build): DamageAnalysis {
  const scalingBreakdown = createDamageWalkthrough(build);
  const topContributors = findTopContributors(build, scalingBreakdown);
  const scalingOpportunities = identifyScalingOpportunities(build, scalingBreakdown);

  // Calculate final DPS from the pipeline
  const lastStep = scalingBreakdown[scalingBreakdown.length - 1];
  const totalDps = lastStep?.afterValue || 0;

  const explanation = generateDamageExplanation(build, scalingBreakdown);

  return {
    totalDps,
    scalingBreakdown,
    topContributors,
    scalingOpportunities,
    explanation,
  };
}

/**
 * Creates a step-by-step damage calculation walkthrough
 */
export function createDamageWalkthrough(build: Build): ScalingStep[] {
  const steps: ScalingStep[] = [];

  // Step 1: Base Damage (from weapon or spell)
  const baseDamage = estimateBaseDamage(build);
  if (baseDamage > 0) {
    steps.push({
      name: 'Base Damage',
      category: 'base',
      beforeValue: 0,
      afterValue: baseDamage,
      multiplier: 1,
      sources: [getBaseDamageSource(build)],
      explanation:
        'This is your starting damage from your weapon or spell base. Everything scales from here.',
    });
  }

  // Step 2: Flat Added Damage
  const flatAdded = estimateFlatAdded(build);
  if (flatAdded > 0) {
    const before = baseDamage;
    const after = before + flatAdded;
    steps.push({
      name: 'Flat Added Damage',
      category: 'flat',
      beforeValue: before,
      afterValue: after,
      multiplier: after / before,
      sources: ['Support gems', 'Item mods', 'Passive nodes'],
      explanation: 'Flat damage is added to your base before any % increases apply.',
    });
  }

  // Step 3: Increased Damage
  const increasedPercent = estimateIncreasedDamage(build);
  if (increasedPercent > 0) {
    const before = steps[steps.length - 1]?.afterValue || baseDamage;
    const after = before * (1 + increasedPercent / 100);
    steps.push({
      name: 'Increased Damage',
      category: 'increased',
      beforeValue: before,
      afterValue: after,
      multiplier: 1 + increasedPercent / 100,
      sources: ['Passive tree', 'Item mods', 'Gem quality'],
      explanation: `All "increased" damage sources add together, then multiply. You have ${increasedPercent.toFixed(0)}% total increased damage.`,
    });
  }

  // Step 4: More Multipliers
  const moreMultiplier = estimateMoreMultipliers(build);
  if (moreMultiplier > 1) {
    const before = steps[steps.length - 1]?.afterValue || baseDamage;
    const after = before * moreMultiplier;
    steps.push({
      name: 'More Multipliers',
      category: 'more',
      beforeValue: before,
      afterValue: after,
      multiplier: moreMultiplier,
      sources: ['Support gems', 'Keystone passives', 'Ascendancy'],
      explanation: `Each "more" multiplier stacks multiplicatively. This is your most powerful scaling layer.`,
    });
  }

  // Step 5: Critical Strikes
  const critMultiplier = estimateCritMultiplier(build);
  if (critMultiplier > 1) {
    const before = steps[steps.length - 1]?.afterValue || baseDamage;
    const after = before * critMultiplier;
    steps.push({
      name: 'Critical Strikes',
      category: 'crit',
      beforeValue: before,
      afterValue: after,
      multiplier: critMultiplier,
      sources: ['Crit chance', 'Crit multiplier'],
      explanation: 'Critical strikes multiply your damage. Average crit bonus depends on both chance and multiplier.',
    });
  }

  // Step 6: Attack/Cast Speed
  const speed = estimateSpeed(build);
  if (speed > 0) {
    const before = steps[steps.length - 1]?.afterValue || baseDamage;
    const after = before * speed;
    steps.push({
      name: 'Attack/Cast Speed',
      category: 'speed',
      beforeValue: before,
      afterValue: after,
      multiplier: speed,
      sources: ['Weapon APS', 'Increased attack speed', 'Cast speed'],
      explanation: `You attack/cast ${speed.toFixed(2)} times per second, multiplying your hit damage into DPS.`,
    });
  }

  return steps;
}

/**
 * Identifies the biggest damage bottleneck
 */
export function findDamageBottleneck(build: Build): ScalingOpportunity {
  const opportunities = identifyScalingOpportunities(build, createDamageWalkthrough(build));
  return opportunities[0] || {
    category: 'General',
    currentValue: 0,
    potentialGain: 0,
    difficulty: 'medium',
    suggestions: ['Level up your character', 'Improve your gear'],
  };
}

// Helper functions for estimation

function estimateBaseDamage(build: Build): number {
  // Look for weapon damage
  const weapon = Array.from(build.items.slots.entries()).find(([slot]) =>
    slot.includes('Weapon')
  )?.[1];

  if (weapon?.weaponStats?.physicalDamage) {
    return (weapon.weaponStats.physicalDamage.min + weapon.weaponStats.physicalDamage.max) / 2;
  }

  // For spells, estimate from level
  return build.level * 2.5;
}

function getBaseDamageSource(build: Build): string {
  const weapon = Array.from(build.items.slots.entries()).find(([slot]) =>
    slot.includes('Weapon')
  )?.[1];
  return weapon ? `${weapon.name} weapon` : 'Spell base damage';
}

function estimateFlatAdded(build: Build): number {
  // Estimate flat damage from support gems and level
  const gemCount = build.skills.skillGroups.reduce((sum, group) => sum + group.gems.length, 0);
  return gemCount * build.level * 0.5;
}

function estimateIncreasedDamage(build: Build): number {
  // Rough estimate based on passive points
  // Average build has ~5% increased per point
  return build.passiveTree.allocatedNodes.size * 5;
}

function estimateMoreMultipliers(build: Build): number {
  // Support gems provide the bulk of More multipliers
  const supportGems = build.skills.skillGroups.reduce(
    (count, group) => count + group.gems.filter((g) => g.isSupport).length,
    0
  );

  // Each support typically gives 1.3-1.5x more damage
  // Using 1.35 average
  return Math.pow(1.35, supportGems);
}

function estimateCritMultiplier(build: Build): number {
  // Assume 50% crit chance, 200% crit multi as baseline
  // Average damage = (1 - critChance) * 1 + critChance * critMulti
  const critChance = 0.5;
  const critMulti = 2.0;
  return 1 - critChance + critChance * critMulti;
}

function estimateSpeed(build: Build): number {
  // Check weapon APS
  const weapon = Array.from(build.items.slots.entries()).find(([slot]) =>
    slot.includes('Weapon')
  )?.[1];

  if (weapon?.weaponStats?.attacksPerSecond) {
    return weapon.weaponStats.attacksPerSecond * 1.5; // Account for inc. attack speed
  }

  // Spells cast around 2-3 times per second
  return 2.5;
}

function findTopContributors(build: Build, steps: ScalingStep[]): DamageContributor[] {
  const contributors: DamageContributor[] = [];

  // Support gems
  const supportCount = build.skills.skillGroups.reduce(
    (count, group) => count + group.gems.filter((g) => g.isSupport).length,
    0
  );
  if (supportCount > 0) {
    const totalDps = steps[steps.length - 1]?.afterValue || 0;
    contributors.push({
      name: `Support Gems (${supportCount}x)`,
      source: 'gem',
      contribution: totalDps * 0.5,
      percentage: 50,
    });
  }

  // Passive tree
  if (build.passiveTree.allocatedNodes.size > 0) {
    const totalDps = steps[steps.length - 1]?.afterValue || 0;
    contributors.push({
      name: `Passive Tree (${build.passiveTree.allocatedNodes.size} nodes)`,
      source: 'passive',
      contribution: totalDps * 0.3,
      percentage: 30,
    });
  }

  // Weapon/base
  if (steps.length > 0) {
    const totalDps = steps[steps.length - 1]?.afterValue || 0;
    contributors.push({
      name: 'Base Damage & Weapon',
      source: 'item',
      contribution: totalDps * 0.15,
      percentage: 15,
    });
  }

  return contributors.sort((a, b) => b.contribution - a.contribution);
}

function identifyScalingOpportunities(
  build: Build,
  steps: ScalingStep[]
): ScalingOpportunity[] {
  const opportunities: ScalingOpportunity[] = [];

  // Check More multipliers
  const moreStep = steps.find((s) => s.category === 'more');
  if (!moreStep || moreStep.multiplier < 3) {
    opportunities.push({
      category: 'More Multipliers',
      currentValue: moreStep?.multiplier || 1,
      potentialGain: 150, // %
      difficulty: 'easy',
      suggestions: [
        'Add more support gems to your main skill',
        'Get a 6-link for maximum supports',
        'Look for "More" multipliers on passives/items',
      ],
    });
  }

  // Check increased damage
  const increasedStep = steps.find((s) => s.category === 'increased');
  if (!increasedStep || increasedStep.multiplier < 3) {
    opportunities.push({
      category: 'Increased Damage',
      currentValue: ((increasedStep?.multiplier || 1) - 1) * 100,
      potentialGain: 100,
      difficulty: 'easy',
      suggestions: [
        'Allocate more damage nodes on passive tree',
        'Get % increased damage on gear',
        'Level up your skill gems for quality',
      ],
    });
  }

  // Check base damage
  const baseStep = steps.find((s) => s.category === 'base');
  if (baseStep && baseStep.afterValue < 100 && build.level >= 40) {
    opportunities.push({
      category: 'Base Damage',
      currentValue: baseStep.afterValue,
      potentialGain: 200,
      difficulty: 'medium',
      suggestions: [
        'Upgrade your weapon to a higher tier base',
        'Get a weapon with more physical damage',
        'Use a higher level skill gem for spells',
      ],
    });
  }

  // Check crit
  const critStep = steps.find((s) => s.category === 'crit');
  if (!critStep || critStep.multiplier < 1.3) {
    opportunities.push({
      category: 'Critical Strikes',
      currentValue: critStep?.multiplier || 1,
      potentialGain: 80,
      difficulty: 'medium',
      suggestions: [
        'Get critical strike chance on gear and tree',
        'Increase critical strike multiplier',
        'Consider Diamond Flask for lucky crits',
      ],
    });
  }

  return opportunities.sort((a, b) => b.potentialGain - a.potentialGain);
}

function generateDamageExplanation(build: Build, steps: ScalingStep[]): string {
  if (steps.length === 0) {
    return 'No damage scaling detected. Make sure your build has skills configured.';
  }

  const lastStep = steps[steps.length - 1];
  const totalDps = lastStep?.afterValue || 0;
  const moreStep = steps.find((s) => s.category === 'more');

  let explanation = `Your build deals approximately ${totalDps.toFixed(0)} DPS. `;

  if (moreStep && moreStep.multiplier < 2) {
    explanation +=
      'Your biggest opportunity is adding More multipliers - support gems are your best source of these.';
  } else if (moreStep && moreStep.multiplier >= 3) {
    explanation +=
      'You have strong More multipliers! Focus on increasing your base damage and crit for further scaling.';
  } else {
    explanation += 'Continue improving all layers of your damage scaling for best results.';
  }

  return explanation;
}

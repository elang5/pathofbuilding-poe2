/**
 * Bottleneck Detection Module
 *
 * Identifies the biggest limiting factors in a build:
 * - What's holding back damage?
 * - What's making you die?
 * - What should be improved first?
 */

import type { Build } from '../domain/build';
import { analyzeDamage, type DamageAnalysis } from './damage';
import { analyzeDefense, type DefenseAnalysis } from './defense';

export interface BottleneckAnalysis {
  buildGrade: 'F' | 'D' | 'C' | 'B' | 'A' | 'S';
  overallHealth: number; // 0-100 score

  // Critical bottlenecks
  criticalBottlenecks: Bottleneck[];

  // All identified bottlenecks
  allBottlenecks: Bottleneck[];

  // Top priority fix
  topPriority: Bottleneck;

  // Summary
  summary: string;
}

export interface Bottleneck {
  id: string;
  category: 'damage' | 'defense' | 'utility' | 'gear' | 'tree';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  estimatedGain: string; // "50% more damage", "2x survivability"
  solutions: Solution[];
}

export interface Solution {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
  steps: string[];
  expectedImprovement: string;
}

/**
 * Analyzes build for bottlenecks
 */
export function analyzeBottlenecks(build: Build): BottleneckAnalysis {
  const damageAnalysis = analyzeDamage(build);
  const defenseAnalysis = analyzeDefense(build);

  const allBottlenecks = identifyAllBottlenecks(build, damageAnalysis, defenseAnalysis);
  const criticalBottlenecks = allBottlenecks.filter((b) => b.severity === 'critical');
  const topPriority = allBottlenecks[0] || createDefaultBottleneck();
  const buildGrade = calculateBuildGrade(damageAnalysis, defenseAnalysis, allBottlenecks);
  const overallHealth = calculateOverallHealth(allBottlenecks);
  const summary = generateBottleneckSummary(buildGrade, topPriority, criticalBottlenecks);

  return {
    buildGrade,
    overallHealth,
    criticalBottlenecks,
    allBottlenecks,
    topPriority,
    summary,
  };
}

/**
 * Identifies all bottlenecks in the build
 */
function identifyAllBottlenecks(
  build: Build,
  damageAnalysis: DamageAnalysis,
  defenseAnalysis: DefenseAnalysis
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  // Defense bottlenecks (prioritized - you can't DPS if you're dead!)
  for (const vuln of defenseAnalysis.vulnerabilities) {
    if (vuln.severity === 'critical' || vuln.severity === 'high') {
      bottlenecks.push(createDefenseBottleneck(vuln, build));
    }
  }

  // Damage bottlenecks
  for (const opportunity of damageAnalysis.scalingOpportunities) {
    if (opportunity.difficulty === 'easy' && opportunity.potentialGain > 50) {
      bottlenecks.push(createDamageBottleneck(opportunity, build));
    }
  }

  // Gear bottlenecks
  bottlenecks.push(...identifyGearBottlenecks(build));

  // Skill gem bottlenecks
  bottlenecks.push(...identifySkillBottlenecks(build));

  // Tree bottlenecks
  bottlenecks.push(...identifyTreeBottlenecks(build, damageAnalysis, defenseAnalysis));

  // Sort by severity
  return bottlenecks.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function createDefenseBottleneck(
  vuln: DefenseAnalysis['vulnerabilities'][0],
  build: Build
): Bottleneck {
  const bottleneck: Bottleneck = {
    id: `defense-${vuln.type}`,
    category: 'defense',
    severity: vuln.severity,
    title: `Vulnerable to ${vuln.type} damage`,
    description: vuln.description,
    impact: vuln.impact,
    estimatedGain: vuln.type === 'elemental' ? '4x survivability' : '2x survivability',
    solutions: [],
  };

  if (vuln.type === 'elemental') {
    bottleneck.solutions.push({
      title: 'Cap Elemental Resistances',
      difficulty: 'easy',
      cost: 'low',
      steps: [
        'Get resist mods on rings and amulet (30-40% each)',
        'Get resist mods on body armour and boots',
        'Allocate resist nodes on passive tree if needed',
        'Use Purity of Elements aura as temporary fix',
      ],
      expectedImprovement: 'Reduce elemental damage taken by 75%',
    });
  } else if (vuln.type === 'physical') {
    bottleneck.solutions.push({
      title: 'Add Physical Mitigation',
      difficulty: 'medium',
      cost: 'medium',
      steps: [
        'For STR builds: Stack armour on gear, use Determination aura',
        'For DEX builds: Stack evasion on gear, use Grace aura',
        'Consider using a shield for block chance',
        'Get Endurance Charges for permanent mitigation',
      ],
      expectedImprovement: 'Reduce physical damage taken by 40-60%',
    });
  } else if (vuln.type === 'chaos') {
    bottleneck.solutions.push({
      title: 'Improve Chaos Resistance',
      difficulty: 'medium',
      cost: 'medium',
      steps: [
        'Get chaos res on rings and amulet',
        'Look for chaos res on jewels',
        'Allocate chaos res nodes on tree',
        'Consider Amethyst Flask for dangerous encounters',
      ],
      expectedImprovement: 'Survive chaos damage that currently kills you',
    });
  } else if (vuln.type === 'oneshots') {
    bottleneck.solutions.push({
      title: 'Increase Life Pool',
      difficulty: 'easy',
      cost: 'low',
      steps: [
        'Get maximum life on all rare items (60-80+ life each)',
        'Allocate life wheel on passive tree',
        'Get life on jewels',
        'Continue leveling - you gain 12 base life per level',
      ],
      expectedImprovement: `Increase life from current to ${build.level * 12}+`,
    });
  }

  return bottleneck;
}

function createDamageBottleneck(
  opportunity: DamageAnalysis['scalingOpportunities'][0],
  build: Build
): Bottleneck {
  return {
    id: `damage-${opportunity.category.toLowerCase().replace(/\s+/g, '-')}`,
    category: 'damage',
    severity: opportunity.difficulty === 'easy' ? 'high' : 'medium',
    title: `Low ${opportunity.category}`,
    description: `Your ${opportunity.category.toLowerCase()} is below expected for your level`,
    impact: `You're missing out on significant damage potential`,
    estimatedGain: `+${opportunity.potentialGain}% more damage`,
    solutions: opportunity.suggestions.map((suggestion) => ({
      title: suggestion,
      difficulty: opportunity.difficulty,
      cost: opportunity.difficulty === 'easy' ? 'free' : 'medium',
      steps: [suggestion],
      expectedImprovement: `+${opportunity.potentialGain}% damage`,
    })),
  };
}

function identifyGearBottlenecks(build: Build): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];
  const totalSlots = 11; // Rough count of important gear slots
  const equippedCount = Array.from(build.items.slots.values()).filter((item) => item !== null)
    .length;

  if (equippedCount < totalSlots * 0.7) {
    bottlenecks.push({
      id: 'gear-missing-items',
      category: 'gear',
      severity: 'high',
      title: 'Missing Gear Pieces',
      description: `Only ${equippedCount} items equipped out of ${totalSlots} slots`,
      impact: 'Every empty slot is missing stats, resistances, and damage potential',
      estimatedGain: `+${(totalSlots - equippedCount) * 20}% overall power`,
      solutions: [
        {
          title: 'Fill Empty Gear Slots',
          difficulty: 'easy',
          cost: 'free',
          steps: [
            'Equip rare items in empty slots',
            'Even low-level rares are better than nothing',
            'Prioritize life and resistances on each piece',
          ],
          expectedImprovement: 'Major improvement to both offense and defense',
        },
      ],
    });
  }

  // Check for weapon quality
  const weapon = Array.from(build.items.slots.entries()).find(([slot]) =>
    slot.includes('Weapon 1')
  )?.[1];

  if (weapon && build.level > 40) {
    const hasWeaponStats = weapon.weaponStats?.physicalDamage;
    if (!hasWeaponStats || (weapon.weaponStats?.physicalDamage?.max || 0) < build.level) {
      bottlenecks.push({
        id: 'gear-weak-weapon',
        category: 'gear',
        severity: 'high',
        title: 'Weapon Needs Upgrade',
        description: 'Your weapon is significantly below your character level',
        impact: 'All damage scaling starts with weapon DPS',
        estimatedGain: '+100-200% base damage',
        solutions: [
          {
            title: 'Upgrade Your Weapon',
            difficulty: 'medium',
            cost: 'medium',
            steps: [
              'Look for weapons with higher physical damage',
              'Prioritize attack speed for attack builds',
              'For spells, weapon damage matters less - focus on +gem levels',
              'Consider crafting if you have currency',
            ],
            expectedImprovement: 'Double or triple your DPS',
          },
        ],
      });
    }
  }

  return bottlenecks;
}

function identifySkillBottlenecks(build: Build): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  for (const group of build.skills.skillGroups) {
    const activeGems = group.gems.filter((g) => !g.isSupport);
    const supportGems = group.gems.filter((g) => g.isSupport);

    // Check for insufficient supports
    if (group.enabled && activeGems.length > 0 && supportGems.length < 3) {
      bottlenecks.push({
        id: `skill-${group.id}-links`,
        category: 'damage',
        severity: supportGems.length === 0 ? 'critical' : 'high',
        title: `${group.slot || 'Main skill'} only has ${supportGems.length} support gems`,
        description: `You have a ${group.gems.length}-link but need more support gems`,
        impact: 'Support gems are the #1 source of damage - each adds 30-50% MORE damage',
        estimatedGain: `+${(5 - supportGems.length) * 40}% more damage`,
        solutions: [
          {
            title: 'Add More Support Gems',
            difficulty: 'easy',
            cost: 'free',
            steps: [
              'Get a 5-link or 6-link item (body armour or 2H weapon)',
              'Add support gems that boost your main skill',
              'Common supports: Increased Critical Damage, Elemental Damage with Attacks, etc.',
              'Check the gem vendor in town for support gems',
            ],
            expectedImprovement: 'Each support gem adds ~40% MORE damage',
          },
        ],
      });
    }

    // Check for low level gems
    const lowLevelGems = group.gems.filter((g) => g.enabled && g.level < build.level - 10);
    if (lowLevelGems.length > 0 && build.level > 30) {
      bottlenecks.push({
        id: `skill-${group.id}-levels`,
        category: 'damage',
        severity: 'medium',
        title: `Gems are under-leveled in ${group.slot || 'skill group'}`,
        description: `${lowLevelGems.length} gems are more than 10 levels behind your character`,
        impact: 'Gem levels significantly increase base damage and effectiveness',
        estimatedGain: '+30-50% damage',
        solutions: [
          {
            title: 'Level Up Your Gems',
            difficulty: 'easy',
            cost: 'free',
            steps: [
              'Click the "+" icon next to gems when they level up',
              'Keep gems equipped as you play to gain XP',
              'Buy higher level gems from vendors if far behind',
            ],
            expectedImprovement: 'Significant damage increase per gem level',
          },
        ],
      });
    }
  }

  return bottlenecks;
}

function identifyTreeBottlenecks(
  build: Build,
  damageAnalysis: DamageAnalysis,
  defenseAnalysis: DefenseAnalysis
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  const pointsAllocated = build.passiveTree.allocatedNodes.size;
  const expectedPoints = Math.min(build.level + 22, 132); // Gain passive point every level, plus quests

  if (pointsAllocated < expectedPoints * 0.8) {
    bottlenecks.push({
      id: 'tree-unspent-points',
      category: 'tree',
      severity: 'high',
      title: 'Unspent Passive Points',
      description: `You have only allocated ${pointsAllocated} out of ~${expectedPoints} available points`,
      impact: 'Every passive point is ~5% increased damage or significant defensive value',
      estimatedGain: `+${(expectedPoints - pointsAllocated) * 5}% increased damage`,
      solutions: [
        {
          title: 'Allocate Passive Points',
          difficulty: 'easy',
          cost: 'free',
          steps: [
            'Open the passive tree and spend available points',
            'Follow a path toward important keystones',
            'Prioritize life nodes and damage nodes for your skill type',
          ],
          expectedImprovement: 'Major improvement to both offense and defense',
        },
      ],
    });
  }

  // Check for balance between offense and defense
  const hasDefenseVulns = defenseAnalysis.vulnerabilities.filter(
    (v) => v.severity === 'critical' || v.severity === 'high'
  ).length;
  const hasDamageOpportunities = damageAnalysis.scalingOpportunities.length;

  if (hasDefenseVulns > 2 && pointsAllocated > 40) {
    bottlenecks.push({
      id: 'tree-no-defense',
      category: 'tree',
      severity: 'high',
      title: 'Passive Tree Lacks Defensive Nodes',
      description: 'Too many points spent on damage without defensive investment',
      impact: "You can't deal damage if you're dead",
      estimatedGain: '2-3x survivability',
      solutions: [
        {
          title: 'Rebalance Tree Toward Defense',
          difficulty: 'medium',
          cost: 'medium',
          steps: [
            'Allocate the nearby life wheel (8-10 nodes of life%)',
            'Path through resist nodes if resistances are low',
            'Consider using 5-10 regret orbs to respec weak damage nodes',
          ],
          expectedImprovement: 'Dramatically improved survivability',
        },
      ],
    });
  }

  return bottlenecks;
}

function calculateBuildGrade(
  damageAnalysis: DamageAnalysis,
  defenseAnalysis: DefenseAnalysis,
  bottlenecks: Bottleneck[]
): 'F' | 'D' | 'C' | 'B' | 'A' | 'S' {
  const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'critical').length;
  const highBottlenecks = bottlenecks.filter((b) => b.severity === 'high').length;

  // Defense rating is most important
  const defenseScore =
    defenseAnalysis.survivalRating === 'Excellent'
      ? 5
      : defenseAnalysis.survivalRating === 'Strong'
        ? 4
        : defenseAnalysis.survivalRating === 'Moderate'
          ? 3
          : defenseAnalysis.survivalRating === 'Weak'
            ? 2
            : 1;

  // Damage matters too
  const damageScore = damageAnalysis.totalDps > 100000 ? 5 : damageAnalysis.totalDps > 50000 ? 4 : damageAnalysis.totalDps > 20000 ? 3 : damageAnalysis.totalDps > 5000 ? 2 : 1;

  // Bottlenecks penalize
  const bottleneckPenalty = criticalBottlenecks * 2 + highBottlenecks;

  const totalScore = defenseScore + damageScore - bottleneckPenalty;

  if (totalScore >= 9) return 'S';
  if (totalScore >= 7) return 'A';
  if (totalScore >= 5) return 'B';
  if (totalScore >= 3) return 'C';
  if (totalScore >= 1) return 'D';
  return 'F';
}

function calculateOverallHealth(bottlenecks: Bottleneck[]): number {
  const criticalCount = bottlenecks.filter((b) => b.severity === 'critical').length;
  const highCount = bottlenecks.filter((b) => b.severity === 'high').length;
  const mediumCount = bottlenecks.filter((b) => b.severity === 'medium').length;

  // Start at 100, subtract penalties
  let health = 100;
  health -= criticalCount * 30;
  health -= highCount * 15;
  health -= mediumCount * 5;

  return Math.max(0, health);
}

function generateBottleneckSummary(
  grade: string,
  topPriority: Bottleneck,
  criticalBottlenecks: Bottleneck[]
): string {
  let summary = `Your build receives a grade of **${grade}**. `;

  if (criticalBottlenecks.length > 0) {
    summary += `You have ${criticalBottlenecks.length} critical issue${criticalBottlenecks.length > 1 ? 's' : ''} that must be addressed. `;
    summary += `Start by fixing: **${topPriority.title}**.`;
  } else if (grade === 'S' || grade === 'A') {
    summary += 'Your build is in excellent shape! Focus on min-maxing and endgame optimization.';
  } else {
    summary += `Your biggest bottleneck is **${topPriority.title}**. Fixing this will provide the most impact.`;
  }

  return summary;
}

function createDefaultBottleneck(): Bottleneck {
  return {
    id: 'default',
    category: 'utility',
    severity: 'low',
    title: 'Continue Improving',
    description: 'Your build is solid - focus on incremental improvements',
    impact: 'Small gains add up over time',
    estimatedGain: '+10-20% overall power',
    solutions: [
      {
        title: 'Incremental Upgrades',
        difficulty: 'medium',
        cost: 'medium',
        steps: [
          'Upgrade gear pieces one at a time',
          'Level up gems to 20 and quality them',
          'Optimize passive tree',
          'Learn boss mechanics',
        ],
        expectedImprovement: 'Steady progression toward endgame',
      },
    ],
  };
}

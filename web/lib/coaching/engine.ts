/**
 * Coaching Intelligence Engine
 *
 * Analyzes builds and provides educational recommendations based on:
 * - Current meta knowledge
 * - Build archetype matching
 * - Best practices and common patterns
 * - Performance optimization opportunities
 */

import type { Build } from '../domain/build';
import type { BuildAnalysis, Recommendation } from './types';
import {
  META_ARCHETYPES,
  type BuildArchetype,
  type MetaTier,
  getArchetypeByClass,
  getBeginnerArchetypes,
} from '../meta/knowledge-base';

const META_VERSION = '0.3.1-december-2025';

/**
 * Analyze a build and provide recommendations
 */
export function analyzeBuild(build: Build): BuildAnalysis {
  const matchingArchetypes = findMatchingArchetypes(build);
  const recommendations = generateRecommendations(build, matchingArchetypes);
  const performance = estimatePerformance(build, matchingArchetypes);
  const { strengths, issues } = analyzeStrengthsAndIssues(build, matchingArchetypes);
  const overallScore = calculateOverallScore(build, matchingArchetypes, recommendations);
  const metaAlignment = calculateMetaAlignment(matchingArchetypes);

  return {
    build,
    overallScore,
    metaAlignment,
    matchingArchetypes,
    estimatedPerformance: performance,
    strengths,
    issues,
    recommendations: {
      critical: recommendations.filter((r) => r.severity === 'critical'),
      warnings: recommendations.filter((r) => r.severity === 'warning'),
      suggestions: recommendations.filter((r) => r.severity === 'suggestion'),
      tips: recommendations.filter((r) => r.severity === 'info'),
    },
    analyzedAt: new Date(),
    metaVersion: META_VERSION,
  };
}

/**
 * Find archetypes that match the build
 */
function findMatchingArchetypes(build: Build): {
  archetype: BuildArchetype;
  matchScore: number;
  reasons: string[];
}[] {
  const classArchetypes = getArchetypeByClass(build.className, build.ascendancy ?? undefined);
  const allArchetypes = classArchetypes.length > 0 ? classArchetypes : META_ARCHETYPES;

  const matches = allArchetypes.map((archetype) => {
    let score = 0;
    const reasons: string[] = [];

    // Class match (base 30 points)
    if (archetype.className === build.className) {
      score += 30;
      reasons.push(`Matches class: ${build.className}`);
    }

    // Ascendancy match (additional 30 points)
    if (archetype.ascendancy === build.ascendancy) {
      score += 30;
      reasons.push(`Matches ascendancy: ${build.ascendancy}`);
    }

    // Skill matches (up to 40 points)
    const buildSkills = build.skills.skillGroups
      .flatMap((skillGroup) => skillGroup.gems)
      .map((gem) => gem.name)
      .filter((name) => name);

    const primaryMatches = archetype.primarySkills.filter((skill) =>
      buildSkills.some((bs) => bs.toLowerCase().includes(skill.toLowerCase()))
    );

    const secondaryMatches = archetype.secondarySkills.filter((skill) =>
      buildSkills.some((bs) => bs.toLowerCase().includes(skill.toLowerCase()))
    );

    if (primaryMatches.length > 0) {
      score += Math.min(30, primaryMatches.length * 15);
      reasons.push(
        `Uses primary skill${primaryMatches.length > 1 ? 's' : ''}: ${primaryMatches.join(', ')}`
      );
    }

    if (secondaryMatches.length > 0) {
      score += Math.min(10, secondaryMatches.length * 5);
      reasons.push(
        `Uses secondary skill${secondaryMatches.length > 1 ? 's' : ''}: ${secondaryMatches.join(', ')}`
      );
    }

    return {
      archetype,
      matchScore: Math.min(100, score),
      reasons,
    };
  });

  // Return top 3 matches, sorted by score
  return matches
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

/**
 * Generate recommendations for a build
 */
function generateRecommendations(
  build: Build,
  matchingArchetypes: { archetype: BuildArchetype; matchScore: number; reasons: string[] }[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Passive tree recommendations
  recommendations.push(...analyzePassiveTree(build));

  // Skills recommendations
  recommendations.push(...analyzeSkills(build, matchingArchetypes));

  // Items recommendations
  recommendations.push(...analyzeItems(build));

  // Meta alignment recommendations
  recommendations.push(...analyzeMetaAlignment(build, matchingArchetypes));

  // Beginner tips
  if (build.level < 50) {
    recommendations.push(...generateBeginnerTips(build));
  }

  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Analyze passive tree allocation
 */
function analyzePassiveTree(build: Build): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const allocatedCount = build.passiveTree.allocatedNodes.size;

  // Check if tree is under-allocated for level
  const expectedNodes = Math.floor(build.level / 1.5) + 20; // Rough estimate
  if (allocatedCount < expectedNodes * 0.7) {
    recommendations.push({
      id: 'passive-underallocated',
      severity: 'warning',
      category: 'passive-tree',
      title: 'Passive Tree Under-Allocated',
      description: `You have ${allocatedCount} passive nodes allocated, but at level ${build.level} you could have around ${expectedNodes}.`,
      rationale:
        'Passive skills are a major source of power. Make sure to allocate your passive points as you level.',
      priority: 8,
      suggestedActions: [
        {
          label: 'Review passive tree',
          description: 'Plan your passive tree path to maximize offensive and defensive stats',
        },
      ],
    });
  }

  // Check jewel socket usage
  if (build.level >= 40 && build.passiveTree.jewelSockets.length === 0) {
    recommendations.push({
      id: 'no-jewel-sockets',
      severity: 'suggestion',
      category: 'passive-tree',
      title: 'Consider Allocating Jewel Sockets',
      description: 'You haven&apos;t allocated any jewel sockets yet.',
      rationale:
        'Jewel sockets can provide powerful stats and unique modifiers that complement your build.',
      priority: 6,
    });
  }

  return recommendations;
}

/**
 * Analyze skill setup
 */
function analyzeSkills(
  build: Build,
  matchingArchetypes: { archetype: BuildArchetype; matchScore: number }[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (build.skills.skillGroups.length === 0) {
    recommendations.push({
      id: 'no-skills-configured',
      severity: 'critical',
      category: 'skills',
      title: 'No Skills Configured',
      description: 'Your build doesn&apos;t have any skill gems set up.',
      rationale: 'Skills are the core of your build&apos;s damage and utility.',
      priority: 10,
    });
    return recommendations;
  }

  // Check for 6-link potential at high level
  if (build.level >= 60) {
    const hasSixLink = build.skills.skillGroups.some((skillGroup) => skillGroup.gems.length >= 6);
    if (!hasSixLink) {
      recommendations.push({
        id: 'no-six-link',
        severity: 'suggestion',
        category: 'skills',
        title: 'Consider Setting Up a 6-Link',
        description: 'At your level, a 6-linked skill can significantly increase your damage.',
        rationale:
          'Each additional support gem multiplies your skill&apos;s effectiveness. A 6-link is a major power spike.',
        priority: 7,
      });
    }
  }

  // Check if skills align with matched archetypes
  const topMatchForSkills = matchingArchetypes[0];
  if (topMatchForSkills && topMatchForSkills.matchScore >= 60) {
    const topArchetype = topMatchForSkills.archetype;
    if (topArchetype) {
      const buildSkills = build.skills.skillGroups
        .flatMap((skillGroup) => skillGroup.gems)
        .map((gem) => gem.name.toLowerCase());

      const missingPrimary = topArchetype.primarySkills.filter(
        (skill) => !buildSkills.some((bs) => bs.includes(skill.toLowerCase()))
      );

      const topMatch = matchingArchetypes[0];
      if (missingPrimary.length > 0 && topMatch && topMatch.matchScore < 100) {
        recommendations.push({
          id: 'archetype-skill-suggestion',
          severity: 'info',
          category: 'skills',
          title: `Consider ${topArchetype.name} Skills`,
          description: `Based on your class and ascendancy, you might want to use: ${missingPrimary.join(', ')}`,
          rationale: `The ${topArchetype.name} archetype (${topArchetype.tier}-tier, ${topArchetype.popularity}% popularity) commonly uses these skills.`,
          priority: 5,
          relatedArchetypes: [topArchetype.id],
        });
      }
    }
  }

  return recommendations;
}

/**
 * Analyze items and gear
 */
function analyzeItems(build: Build): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const equippedCount = Array.from(build.items.slots.values()).filter(
    (item) => item !== null
  ).length;

  if (build.level >= 30 && equippedCount < 8) {
    recommendations.push({
      id: 'missing-gear',
      severity: 'warning',
      category: 'items',
      title: 'Equipment Slots Not Filled',
      description: `You only have ${equippedCount} item slots filled.`,
      rationale: 'Each equipment slot provides valuable stats for offense and defense.',
      priority: 7,
    });
  }

  // TODO: Check for defensive items and life pool when we have proper stats structure
  // For now, skip these checks as stats structure needs to be properly defined

  return recommendations;
}

/**
 * Analyze meta alignment
 */
function analyzeMetaAlignment(
  build: Build,
  matchingArchetypes: { archetype: BuildArchetype; matchScore: number }[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (matchingArchetypes.length === 0) {
    recommendations.push({
      id: 'no-archetype-match',
      severity: 'info',
      category: 'meta-alignment',
      title: 'Unique Build Path',
      description: 'Your build doesn&apos;t closely match any current meta archetypes.',
      rationale:
        'This could mean you&apos;re pioneering a new strategy, or the build might need refinement. Meta builds are proven to work well.',
      priority: 4,
    });

    // Suggest beginner-friendly alternatives
    const beginnerArchetypes = getBeginnerArchetypes();
    if (build.level < 50 && beginnerArchetypes.length > 0) {
      const topBeginner = beginnerArchetypes[0];
      if (topBeginner) {
        recommendations.push({
          id: 'beginner-suggestion',
          severity: 'info',
          category: 'meta-alignment',
          title: 'Consider a Proven Beginner Build',
          description: `${topBeginner.name} is currently the most popular beginner-friendly build (${topBeginner.popularity}% of players).`,
          rationale: topBeginner.description,
          priority: 3,
          relatedArchetypes: [topBeginner.id],
          ...(topBeginner.guideUrl
            ? { relatedResources: [{ title: 'Build Guide', url: topBeginner.guideUrl }] }
            : {}),
        });
      }
    }
  } else {
    const topMatch = matchingArchetypes[0];
    if (topMatch && topMatch.matchScore >= 60) {
      recommendations.push({
        id: 'archetype-identified',
        severity: 'info',
        category: 'meta-alignment',
        title: `Identified as ${topMatch.archetype.name}`,
        description: `Your build matches the ${topMatch.archetype.name} archetype (${topMatch.matchScore}% match).`,
        rationale: `This is a ${topMatch.archetype.tier}-tier build with ${topMatch.archetype.popularity}% popularity. ${topMatch.archetype.description}`,
        priority: 2,
        relatedArchetypes: [topMatch.archetype.id],
        ...(topMatch.archetype.guideUrl
          ? { relatedResources: [{ title: 'Build Guide', url: topMatch.archetype.guideUrl }] }
          : {}),
      });
    }
  }

  return recommendations;
}

/**
 * Generate beginner tips
 */
function generateBeginnerTips(build: Build): Recommendation[] {
  const tips: Recommendation[] = [];

  if (build.level < 20) {
    tips.push({
      id: 'beginner-tip-resistances',
      severity: 'info',
      category: 'beginner-tip',
      title: 'Don&apos;t Forget Resistances',
      description:
        'Elemental resistances (Fire, Cold, Lightning) are crucial for survival. Aim for 75% in each.',
      rationale:
        'Resistances reduce elemental damage taken. Without capped resistances, you&apos;ll die frequently to elemental attacks.',
      priority: 8,
    });
  }

  if (build.level < 30) {
    tips.push({
      id: 'beginner-tip-flasks',
      severity: 'info',
      category: 'beginner-tip',
      title: 'Keep Your Flasks Updated',
      description: 'Upgrade your life and utility flasks as you level.',
      rationale:
        'Flasks provide instant recovery and utility. Higher-tier flasks are significantly more effective.',
      priority: 6,
    });
  }

  return tips;
}

/**
 * Estimate build performance
 */
function estimatePerformance(
  build: Build,
  matchingArchetypes: { archetype: BuildArchetype; matchScore: number }[]
): {
  clearSpeed: number;
  bossing: number;
  survivability: number;
} {
  // Default moderate values
  let clearSpeed = 5;
  let bossing = 5;
  let survivability = 5;

  // If we have a good archetype match, use its performance metrics
  const topMatch = matchingArchetypes[0];
  if (topMatch && topMatch.matchScore >= 50) {
    const archetype = topMatch.archetype;
    const matchFactor = topMatch.matchScore / 100;

    clearSpeed = Math.round(archetype.clearSpeed * matchFactor);
    bossing = Math.round(archetype.bossing * matchFactor);
    survivability = Math.round(archetype.survivability * matchFactor);
  }

  // Adjust based on level (lower level = lower performance)
  const levelFactor = Math.min(1, build.level / 70);
  clearSpeed = Math.max(1, Math.round(clearSpeed * levelFactor));
  bossing = Math.max(1, Math.round(bossing * levelFactor));
  survivability = Math.max(1, Math.round(survivability * levelFactor));

  return { clearSpeed, bossing, survivability };
}

/**
 * Analyze strengths and issues
 */
function analyzeStrengthsAndIssues(
  build: Build,
  matchingArchetypes: { archetype: BuildArchetype }[]
): {
  strengths: string[];
  issues: string[];
} {
  const strengths: string[] = [];
  const issues: string[] = [];

  // Archetype-based strengths
  if (matchingArchetypes.length > 0 && matchingArchetypes[0]?.archetype) {
    strengths.push(...matchingArchetypes[0].archetype.strengths.slice(0, 3));
  }

  // Level-based
  if (build.level >= 80) {
    strengths.push('High character level');
  }

  // Passive tree
  if (build.passiveTree.allocatedNodes.size >= 60) {
    strengths.push('Well-developed passive tree');
  }

  // Skills
  if (build.skills.skillGroups.some((skillGroup) => skillGroup.gems.length >= 6)) {
    strengths.push('Has 6-linked skill setup');
  }

  // Issues
  if (build.level < 30 && build.passiveTree.allocatedNodes.size < 25) {
    issues.push('Passive tree needs more development');
  }

  if (build.skills.skillGroups.length < 2) {
    issues.push('Limited skill variety');
  }

  return { strengths, issues };
}

/**
 * Calculate overall build score
 */
function calculateOverallScore(
  build: Build,
  matchingArchetypes: { matchScore: number }[],
  recommendations: Recommendation[]
): number {
  let score = 50; // Base score

  // Archetype alignment bonus
  if (matchingArchetypes.length > 0 && matchingArchetypes[0]) {
    score += matchingArchetypes[0].matchScore * 0.3; // Up to +30
  }

  // Passive tree completion
  const expectedNodes = Math.floor(build.level / 1.5) + 20;
  const nodeRatio = Math.min(1, build.passiveTree.allocatedNodes.size / expectedNodes);
  score += nodeRatio * 10; // Up to +10

  // Skills setup
  if (build.skills.skillGroups.length > 0) {
    score += 5;
  }
  if (build.skills.skillGroups.some((sg) => sg.gems.length >= 6)) {
    score += 5;
  }

  // Deduct for critical issues
  const criticalIssues = recommendations.filter((r) => r.severity === 'critical');
  score -= criticalIssues.length * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate meta alignment tier
 */
function calculateMetaAlignment(
  matchingArchetypes: {
    archetype: BuildArchetype;
    matchScore: number;
  }[]
): MetaTier {
  if (matchingArchetypes.length === 0) {
    return 'D';
  }

  const topMatch = matchingArchetypes[0];
  if (!topMatch) {
    return 'D';
  }

  // If high match score with top-tier archetype
  if (topMatch.matchScore >= 80 && topMatch.archetype.tier === 'S') {
    return 'S';
  }

  if (topMatch.matchScore >= 70 && ['S', 'A'].includes(topMatch.archetype.tier)) {
    return 'A';
  }

  if (topMatch.matchScore >= 50) {
    return 'B';
  }

  if (topMatch.matchScore >= 30) {
    return 'C';
  }

  return 'D';
}

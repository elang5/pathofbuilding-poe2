/**
 * Suggestions Engine
 *
 * Generates actionable, prioritized recommendations based on build analysis.
 * Combines damage, defense, and bottleneck data into concrete next steps.
 */

import type { Build } from '../domain/build';
import { analyzeDamage } from './damage';
import { analyzeDefense } from './defense';
import { analyzeBottlenecks } from './bottlenecks';

export interface SuggestionSet {
  // Immediate actions (can do right now)
  immediate: Suggestion[];

  // Short-term goals (within a few maps/levels)
  shortTerm: Suggestion[];

  // Long-term investments (major upgrades)
  longTerm: Suggestion[];

  // Learning resources
  learning: LearningSuggestion[];
}

export interface Suggestion {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'defense' | 'damage' | 'gear' | 'gems' | 'tree' | 'quality-of-life';
  title: string;
  description: string;
  benefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  steps: ActionStep[];
  expectedImpact: string;
}

export interface ActionStep {
  description: string;
  tooltip?: string;
}

export interface LearningSuggestion {
  topic: string;
  description: string;
  why: string;
  resources: string[];
}

/**
 * Generates comprehensive suggestions for a build
 */
export function generateSuggestions(build: Build): SuggestionSet {
  const damageAnalysis = analyzeDamage(build);
  const defenseAnalysis = analyzeDefense(build);
  const bottleneckAnalysis = analyzeBottlenecks(build);

  const allSuggestions: Suggestion[] = [];

  // Generate suggestions from bottlenecks (highest priority)
  for (const bottleneck of bottleneckAnalysis.allBottlenecks) {
    for (const solution of bottleneck.solutions) {
      allSuggestions.push({
        id: `${bottleneck.id}-${solution.title.toLowerCase().replace(/\s+/g, '-')}`,
        priority: bottleneck.severity,
        category: bottleneck.category as Suggestion['category'],
        title: solution.title,
        description: bottleneck.description,
        benefit: bottleneck.impact,
        difficulty: solution.difficulty,
        cost: solution.cost,
        timeframe: determineTimeframe(solution.difficulty, solution.cost),
        steps: solution.steps.map((step) => ({ description: step })),
        expectedImpact: solution.expectedImprovement,
      });
    }
  }

  // Add defense improvements
  for (const improvement of defenseAnalysis.improvements) {
    if (!allSuggestions.find((s) => s.title.includes(improvement.layer))) {
      allSuggestions.push({
        id: `defense-${improvement.layer.toLowerCase().replace(/\s+/g, '-')}`,
        priority: improvement.priority,
        category: 'defense',
        title: `Improve ${improvement.layer}`,
        description: `Current: ${improvement.currentValue.toFixed(0)}, Target: ${improvement.targetValue.toFixed(0)}`,
        benefit: improvement.benefit,
        difficulty: 'medium',
        cost: 'medium',
        timeframe: 'short-term',
        steps: improvement.steps.map((step) => ({ description: step })),
        expectedImpact: improvement.benefit,
      });
    }
  }

  // Add damage scaling opportunities
  for (const opportunity of damageAnalysis.scalingOpportunities) {
    if (opportunity.difficulty === 'easy' && opportunity.potentialGain > 30) {
      const suggestionId = `damage-${opportunity.category.toLowerCase().replace(/\s+/g, '-')}`;
      if (!allSuggestions.find((s) => s.id === suggestionId)) {
        allSuggestions.push({
          id: suggestionId,
          priority: 'medium',
          category: 'damage',
          title: `Boost ${opportunity.category}`,
          description: `Currently at ${opportunity.currentValue.toFixed(0)}`,
          benefit: `Potential gain: +${opportunity.potentialGain}%`,
          difficulty: opportunity.difficulty,
          cost: opportunity.difficulty === 'easy' ? 'low' : 'medium',
          timeframe: opportunity.difficulty === 'easy' ? 'immediate' : 'short-term',
          steps: opportunity.suggestions.map((s) => ({ description: s })),
          expectedImpact: `+${opportunity.potentialGain}% damage`,
        });
      }
    }
  }

  // Add quality-of-life suggestions
  allSuggestions.push(...generateQoLSuggestions(build));

  // Sort by priority
  allSuggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Split by timeframe
  const immediate = allSuggestions.filter((s) => s.timeframe === 'immediate');
  const shortTerm = allSuggestions.filter((s) => s.timeframe === 'short-term');
  const longTerm = allSuggestions.filter((s) => s.timeframe === 'long-term');

  // Generate learning suggestions
  const learning = generateLearningSuggestions(build, damageAnalysis, defenseAnalysis);

  return {
    immediate,
    shortTerm,
    longTerm,
    learning,
  };
}

function determineTimeframe(
  difficulty: 'easy' | 'medium' | 'hard',
  cost: 'free' | 'low' | 'medium' | 'high'
): 'immediate' | 'short-term' | 'long-term' {
  if (difficulty === 'easy' && (cost === 'free' || cost === 'low')) {
    return 'immediate';
  }
  if (difficulty === 'hard' || cost === 'high') {
    return 'long-term';
  }
  return 'short-term';
}

function generateQoLSuggestions(build: Build): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Check for quality on gems
  const lowQualityGems = build.skills.skillGroups.flatMap((group) =>
    group.gems.filter((gem) => gem.quality < 20 && gem.level >= 18)
  );

  if (lowQualityGems.length > 0) {
    suggestions.push({
      id: 'qol-gem-quality',
      priority: 'low',
      category: 'quality-of-life',
      title: 'Improve Gem Quality',
      description: `${lowQualityGems.length} gems have less than 20% quality`,
      benefit: 'Quality adds significant bonuses to gems',
      difficulty: 'medium',
      cost: 'medium',
      timeframe: 'long-term',
      steps: [
        {
          description: 'Level gems to 20, then use Gemcutter\'s Prisms for quality',
          tooltip:
            'Alternative: Vendor a level 20 gem with 1 Gemcutter\'s Prism to get a 20% quality level 1 gem, then level it again',
        },
      ],
      expectedImpact: '+10-20% effectiveness per gem',
    });
  }

  // Check for flask usage
  suggestions.push({
    id: 'qol-flasks',
    priority: 'low',
    category: 'quality-of-life',
    title: 'Optimize Flask Setup',
    description: 'Flasks provide massive temporary power',
    benefit: 'Flasks can double your damage and survivability',
    difficulty: 'easy',
    cost: 'low',
    timeframe: 'immediate',
    steps: [
      { description: 'Get a Diamond Flask for critical strike builds (lucky crits)' },
      { description: 'Get a Quicksilver Flask for movement speed' },
      { description: 'Get element-specific flasks for hard content' },
      { description: 'Roll "of Staunching" suffix on a flask (immune to bleeding)' },
    ],
    expectedImpact: 'Major improvement to clear speed and safety',
  });

  return suggestions;
}

function generateLearningSuggestions(
  build: Build,
  damageAnalysis: ReturnType<typeof analyzeDamage>,
  defenseAnalysis: ReturnType<typeof analyzeDefense>
): LearningSuggestion[] {
  const suggestions: LearningSuggestion[] = [];

  // Always recommend learning about damage scaling
  suggestions.push({
    topic: 'Damage Scaling: Increased vs More',
    description:
      'Understanding the difference between "increased" and "more" multipliers is crucial for optimizing damage.',
    why: '"Increased" mods are additive with each other (100% + 50% = 150%). "More" mods are multiplicative (1.5x × 1.4x = 2.1x). Always prioritize "more" multipliers!',
    resources: [
      'PoE Wiki: Stat Modifiers',
      'In-game: Compare support gems with "More" vs "Increased"',
    ],
  });

  // Recommend learning about resistance capping
  if (defenseAnalysis.vulnerabilities.some((v) => v.type === 'elemental')) {
    suggestions.push({
      topic: 'Elemental Resistances',
      description: 'Capping resistances at 75% is the #1 priority for any build.',
      why: 'With 0% resistance, you take 100% damage. With 75% resistance, you take 25% damage. That\'s 4x survivability!',
      resources: [
        'PoE Wiki: Resistance',
        'General rule: Get 30-40% resist per item on rings, amulet, boots, chest',
      ],
    });
  }

  // Recommend learning about effective HP
  if (defenseAnalysis.effectiveHP < 5000) {
    suggestions.push({
      topic: 'Effective Hit Points (EHP)',
      description: 'Your total survivability is Life × Mitigation × Avoidance × Recovery',
      why: 'Having 4000 life with 0% resistances is worse than 2000 life with 75% resistances (4000 vs 8000 EHP)',
      resources: [
        'PoE Wiki: Defences',
        'Build guides often list "Effective HP" as a defensive metric',
      ],
    });
  }

  // Recommend learning about skill links
  const hasLowLinkCount = build.skills.skillGroups.some(
    (group) => group.enabled && group.gems.filter((g) => g.isSupport).length < 3
  );

  if (hasLowLinkCount) {
    suggestions.push({
      topic: 'Support Gem Links',
      description: 'Support gems are the primary source of damage scaling in PoE2.',
      why: 'Each support gem typically provides 30-50% MORE damage. A 6-link deals 3-5x more damage than a 3-link!',
      resources: [
        'PoE Wiki: Support Gems',
        'Use Path of Building to compare different support combinations',
        'Goal: Get a 5-link or 6-link item as soon as possible',
      ],
    });
  }

  return suggestions;
}

/**
 * Get the single most important suggestion for display
 */
export function getTopSuggestion(suggestionSet: SuggestionSet): Suggestion {
  // Prioritize immediate critical/high suggestions
  const criticalImmediate = suggestionSet.immediate.filter(
    (s) => s.priority === 'critical' || s.priority === 'high'
  );

  if (criticalImmediate.length > 0) {
    return criticalImmediate[0];
  }

  // Fall back to any immediate suggestion
  if (suggestionSet.immediate.length > 0) {
    return suggestionSet.immediate[0];
  }

  // Fall back to short-term
  if (suggestionSet.shortTerm.length > 0) {
    return suggestionSet.shortTerm[0];
  }

  // Fall back to long-term
  if (suggestionSet.longTerm.length > 0) {
    return suggestionSet.longTerm[0];
  }

  // Default fallback
  return {
    id: 'default',
    priority: 'low',
    category: 'quality-of-life',
    title: 'Keep Improving',
    description: 'Your build is in good shape!',
    benefit: 'Continue optimizing for endgame content',
    difficulty: 'medium',
    cost: 'medium',
    timeframe: 'long-term',
    steps: [
      { description: 'Continue leveling and upgrading gear' },
      { description: 'Learn boss mechanics' },
      { description: 'Experiment with different skill combinations' },
    ],
    expectedImpact: 'Steady progression',
  };
}

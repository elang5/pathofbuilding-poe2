/**
 * Coaching System Types
 *
 * Type definitions for the build coaching and recommendation system
 */

import type { Build } from '../domain/build';
import type { BuildArchetype, MetaTier } from '../meta/knowledge-base';

/**
 * Severity of a recommendation
 */
export type RecommendationSeverity = 'critical' | 'warning' | 'suggestion' | 'info';

/**
 * Category of recommendation
 */
export type RecommendationCategory =
  | 'passive-tree'
  | 'skills'
  | 'items'
  | 'defense'
  | 'offense'
  | 'meta-alignment'
  | 'efficiency'
  | 'beginner-tip';

/**
 * A single recommendation for improving a build
 */
export interface Recommendation {
  id: string;
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  title: string;
  description: string;
  rationale: string; // Why this recommendation matters
  priority: number; // 1-10, higher = more important

  // Optional suggested actions
  suggestedActions?: {
    label: string;
    description: string;
  }[];

  // Related meta information
  relatedArchetypes?: string[]; // IDs of archetypes this relates to
  relatedResources?: {
    title: string;
    url: string;
  }[];
}

/**
 * Analysis result for a build
 */
export interface BuildAnalysis {
  build: Build;
  overallScore: number; // 0-100
  metaAlignment: MetaTier; // How well aligned with current meta

  // Matching archetypes
  matchingArchetypes: {
    archetype: BuildArchetype;
    matchScore: number; // 0-100
    reasons: string[];
  }[];

  // Performance estimates
  estimatedPerformance: {
    clearSpeed: number; // 1-10
    bossing: number; // 1-10
    survivability: number; // 1-10
  };

  // Strengths and issues
  strengths: string[];
  issues: string[];

  // Recommendations grouped by category
  recommendations: {
    critical: Recommendation[];
    warnings: Recommendation[];
    suggestions: Recommendation[];
    tips: Recommendation[];
  };

  // Analysis metadata
  analyzedAt: Date;
  metaVersion: string; // e.g., "0.3.1-december-2025"
}

/**
 * Comparison between two builds
 */
export interface BuildComparison {
  build1: Build;
  build2: Build;

  differences: {
    category: string;
    build1Value: string | number;
    build2Value: string | number;
    significance: 'major' | 'minor' | 'negligible';
  }[];

  recommendations: {
    title: string;
    description: string;
    prefersBuild1: boolean;
  }[];
}

/**
 * Learning path for improving a build
 */
export interface LearningPath {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  steps: {
    order: number;
    title: string;
    description: string;
    estimatedTime?: string;
    resources?: {
      title: string;
      url: string;
      type: 'video' | 'guide' | 'tool';
    }[];
    completed?: boolean;
  }[];

  relatedArchetypes: string[];
}

/**
 * Interactive Q&A context
 */
export interface CoachingQuestion {
  id: string;
  question: string;
  context: {
    build?: Build;
    category?: RecommendationCategory;
  };
  timestamp: Date;
}

export interface CoachingAnswer {
  questionId: string;
  answer: string;
  sources?: {
    title: string;
    url: string;
  }[];
  relatedRecommendations?: Recommendation[];
  timestamp: Date;
}

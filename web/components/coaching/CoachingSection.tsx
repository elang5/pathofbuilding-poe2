'use client';

import { useState, useEffect } from 'react';
import type { Build } from '@/lib/domain/build';
import type { BuildAnalysis } from '@/lib/coaching/types';
import { analyzeBuild } from '@/lib/coaching/engine';
import { BuildAnalysisOverview } from './BuildAnalysisOverview';
import { ArchetypeMatches } from './ArchetypeMatches';
import { RecommendationCard } from './RecommendationCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CoachingSectionProps {
  build: Build;
}

/**
 * Main coaching section that displays build analysis and recommendations
 */
export function CoachingSection({ build }: CoachingSectionProps) {
  const [analysis, setAnalysis] = useState<BuildAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'critical' | 'warnings' | 'suggestions'>(
    'all'
  );

  useEffect(() => {
    // Analyze build on mount
    setIsAnalyzing(true);
    try {
      const result = analyzeBuild(build);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze build:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [build]);

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-gray-600">Analyzing your build...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-600">
            Unable to analyze build. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allRecommendations = [
    ...analysis.recommendations.critical,
    ...analysis.recommendations.warnings,
    ...analysis.recommendations.suggestions,
    ...analysis.recommendations.tips,
  ];

  const filteredRecommendations =
    selectedTab === 'all'
      ? allRecommendations
      : selectedTab === 'critical'
        ? analysis.recommendations.critical
        : selectedTab === 'warnings'
          ? analysis.recommendations.warnings
          : [...analysis.recommendations.suggestions, ...analysis.recommendations.tips];

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <BuildAnalysisOverview analysis={analysis} />

      {/* Archetype Matches */}
      <ArchetypeMatches analysis={analysis} />

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Build Coach Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {allRecommendations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-lg font-medium text-green-700">🎉 Excellent Build!</p>
              <p className="mt-2 text-sm text-gray-600">
                Your build looks great! No critical issues or suggestions at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                <TabButton
                  active={selectedTab === 'all'}
                  onClick={() => setSelectedTab('all')}
                  count={allRecommendations.length}
                >
                  All
                </TabButton>
                {analysis.recommendations.critical.length > 0 && (
                  <TabButton
                    active={selectedTab === 'critical'}
                    onClick={() => setSelectedTab('critical')}
                    count={analysis.recommendations.critical.length}
                    variant="error"
                  >
                    Critical
                  </TabButton>
                )}
                {analysis.recommendations.warnings.length > 0 && (
                  <TabButton
                    active={selectedTab === 'warnings'}
                    onClick={() => setSelectedTab('warnings')}
                    count={analysis.recommendations.warnings.length}
                    variant="warning"
                  >
                    Warnings
                  </TabButton>
                )}
                {(analysis.recommendations.suggestions.length > 0 ||
                  analysis.recommendations.tips.length > 0) && (
                  <TabButton
                    active={selectedTab === 'suggestions'}
                    onClick={() => setSelectedTab('suggestions')}
                    count={
                      analysis.recommendations.suggestions.length +
                      analysis.recommendations.tips.length
                    }
                    variant="info"
                  >
                    Suggestions & Tips
                  </TabButton>
                )}
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-4">
                {filteredRecommendations.map((recommendation) => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </div>

              {filteredRecommendations.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-600">
                  No {selectedTab} recommendations
                </p>
              )}
            </div>
          )}

          {/* Meta Version Footer */}
          <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
            Analysis based on meta version: {analysis.metaVersion}
            <br />
            Data sourced from poe.ninja, Maxroll, and community builds
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Tab button component
 */
function TabButton({
  active,
  onClick,
  count,
  variant = 'default',
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  variant?: 'default' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const variantStyles = {
    default: active
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-gray-50 text-gray-700 border-gray-200',
    error: active
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-gray-50 text-gray-700 border-gray-200',
    warning: active
      ? 'bg-orange-100 text-orange-700 border-orange-300'
      : 'bg-gray-50 text-gray-700 border-gray-200',
    info: active
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 ${variantStyles[variant]}`}
    >
      {children} ({count})
    </button>
  );
}

'use client';

import type { BuildAnalysis } from '@/lib/coaching/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface BuildAnalysisOverviewProps {
  analysis: BuildAnalysis;
}

/**
 * Display overall build analysis with score and meta alignment
 */
export function BuildAnalysisOverview({ analysis }: BuildAnalysisOverviewProps) {
  const tierColors = {
    S: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    A: 'text-green-600 bg-green-50 border-green-200',
    B: 'text-blue-600 bg-blue-50 border-blue-200',
    C: 'text-orange-600 bg-orange-50 border-orange-200',
    D: 'text-red-600 bg-red-50 border-red-200',
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Needs Major Improvement';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Overall Build Score</h3>
              <p className="mt-1 text-xs text-gray-500">{getScoreLabel(analysis.overallScore)}</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
              <span className="text-2xl">/100</span>
            </div>
          </div>

          {/* Meta Alignment */}
          <div>
            <h3 className="text-sm font-medium text-gray-700">Meta Alignment</h3>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-3 py-1 text-lg font-semibold ${tierColors[analysis.metaAlignment]}`}
              >
                Tier {analysis.metaAlignment}
              </span>
              <span className="text-sm text-gray-600">
                {analysis.metaAlignment === 'S' && 'Top meta build'}
                {analysis.metaAlignment === 'A' && 'Strong meta build'}
                {analysis.metaAlignment === 'B' && 'Viable build'}
                {analysis.metaAlignment === 'C' && 'Off-meta build'}
                {analysis.metaAlignment === 'D' && 'Experimental build'}
              </span>
            </div>
          </div>

          {/* Performance Estimates */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Estimated Performance</h3>
            <div className="space-y-3">
              <PerformanceBar
                label="Clear Speed"
                value={analysis.estimatedPerformance.clearSpeed}
                max={10}
              />
              <PerformanceBar
                label="Bossing"
                value={analysis.estimatedPerformance.bossing}
                max={10}
              />
              <PerformanceBar
                label="Survivability"
                value={analysis.estimatedPerformance.survivability}
                max={10}
              />
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-green-700">✓ Strengths</h3>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-orange-700">⚠ Areas for Improvement</h3>
              <ul className="space-y-1">
                {analysis.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analysis.recommendations.critical.length +
                  analysis.recommendations.warnings.length}
              </p>
              <p className="text-xs text-gray-600">Issues Found</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analysis.recommendations.suggestions.length + analysis.recommendations.tips.length}
              </p>
              <p className="text-xs text-gray-600">Suggestions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Performance bar component
 */
function PerformanceBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100;
  const getColor = (val: number) => {
    if (val >= 8) return 'bg-green-500';
    if (val >= 6) return 'bg-blue-500';
    if (val >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

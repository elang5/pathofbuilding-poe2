'use client';

import type { DamageAnalysis } from '@/lib/analysis/damage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DamageBreakdownProps {
  analysis: DamageAnalysis;
}

/**
 * Visual damage scaling pipeline
 * Shows Base → Flat → Increased → More → Crit → Speed → DPS
 */
export function DamageBreakdown({ analysis }: DamageBreakdownProps) {
  const { scalingBreakdown, topContributors, scalingOpportunities, totalDps, explanation } =
    analysis;

  if (scalingBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⚔️ Damage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No damage calculation available. Make sure your build has skills configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>⚔️ Damage Breakdown</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {totalDps.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} DPS
            </div>
            <div className="text-xs text-gray-500">Total Damage Per Second</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Explanation */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>

        {/* Scaling Pipeline */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Scaling Pipeline</h3>
          <div className="space-y-2">
            {scalingBreakdown.map((step, idx) => {
              const isFirst = idx === 0;
              const gain = step.afterValue - step.beforeValue;
              const gainPercent = isFirst
                ? 0
                : ((step.afterValue - step.beforeValue) / step.beforeValue) * 100;

              return (
                <div key={idx}>
                  {/* Arrow between steps */}
                  {!isFirst && (
                    <div className="flex items-center justify-center py-1">
                      <div className="text-gray-400">↓</div>
                    </div>
                  )}

                  {/* Step Card */}
                  <div
                    className={`rounded-lg border-2 p-4 ${getCategoryColor(step.category)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Step Name */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{step.name}</span>
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {getCategoryLabel(step.category)}
                          </span>
                        </div>

                        {/* Values */}
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          {!isFirst && (
                            <>
                              <span className="text-gray-600">
                                {step.beforeValue.toFixed(0)}
                              </span>
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <span className="font-semibold text-gray-900">
                            {step.afterValue.toFixed(0)}
                          </span>
                          {!isFirst && (
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-medium ${
                                gainPercent > 50
                                  ? 'bg-green-100 text-green-800'
                                  : gainPercent > 20
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              +{gainPercent.toFixed(0)}%
                            </span>
                          )}
                        </div>

                        {/* Explanation */}
                        <p className="mt-2 text-xs text-gray-600">{step.explanation}</p>

                        {/* Sources */}
                        {step.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.sources.map((source, sourceIdx) => (
                              <span
                                key={sourceIdx}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Multiplier Badge */}
                      {!isFirst && (
                        <div className="ml-4 rounded-lg bg-white px-3 py-2 text-center shadow-sm">
                          <div className="text-xs text-gray-500">×</div>
                          <div className="font-bold text-gray-900">
                            {step.multiplier.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Contributors */}
        {topContributors.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-900">Top Damage Contributors</h3>
            <div className="space-y-2">
              {topContributors.map((contributor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-bold text-blue-700">
                        #{idx + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contributor.name}</div>
                      <div className="text-xs text-gray-500">
                        {getContributorSourceLabel(contributor.source)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {contributor.contribution.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contributor.percentage}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scaling Opportunities */}
        {scalingOpportunities.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Scaling Opportunities</h3>
            <div className="space-y-2">
              {scalingOpportunities.map((opportunity, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 bg-gray-50 p-3 ${getDifficultyColor(opportunity.difficulty)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {opportunity.category}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                          {opportunity.difficulty}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Current: {opportunity.currentValue.toFixed(0)}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {opportunity.suggestions.map((suggestion, suggestionIdx) => (
                          <li
                            key={suggestionIdx}
                            className="text-xs text-gray-600"
                          >
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="rounded-lg bg-green-100 px-3 py-1">
                        <div className="text-xs text-green-700">Potential</div>
                        <div className="font-bold text-green-800">
                          +{opportunity.potentialGain}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-6 rounded-lg bg-purple-50 p-4">
          <h4 className="mb-2 font-semibold text-purple-900">💡 Key Concept</h4>
          <p className="text-sm text-purple-800">
            <strong>&quot;Increased&quot; damage</strong> sources add together, then multiply
            your damage once. <strong>&quot;More&quot; damage</strong> sources multiply
            separately and stack multiplicatively. This is why support gems (which give
            &quot;more&quot; multipliers) are so powerful!
          </p>
          <p className="mt-2 text-xs text-purple-700">
            Example: 100% increased + 50% increased = 150% increased = 2.5x damage.
            <br />
            But: 50% more × 40% more = 1.5 × 1.4 = 2.1x damage from just two mods!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryColor(
  category: 'base' | 'flat' | 'increased' | 'more' | 'crit' | 'speed'
): string {
  switch (category) {
    case 'base':
      return 'border-gray-300 bg-gray-50';
    case 'flat':
      return 'border-green-300 bg-green-50';
    case 'increased':
      return 'border-blue-300 bg-blue-50';
    case 'more':
      return 'border-purple-300 bg-purple-50';
    case 'crit':
      return 'border-orange-300 bg-orange-50';
    case 'speed':
      return 'border-red-300 bg-red-50';
  }
}

function getCategoryLabel(
  category: 'base' | 'flat' | 'increased' | 'more' | 'crit' | 'speed'
): string {
  switch (category) {
    case 'base':
      return 'Base';
    case 'flat':
      return 'Flat Added';
    case 'increased':
      return 'Increased %';
    case 'more':
      return 'More Multiplier';
    case 'crit':
      return 'Critical';
    case 'speed':
      return 'Speed';
  }
}

function getContributorSourceLabel(source: 'item' | 'passive' | 'gem' | 'config'): string {
  switch (source) {
    case 'item':
      return 'From Items';
    case 'passive':
      return 'From Passive Tree';
    case 'gem':
      return 'From Gems';
    case 'config':
      return 'From Configuration';
  }
}

function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'border-l-green-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'hard':
      return 'border-l-red-500';
  }
}

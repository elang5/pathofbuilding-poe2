'use client';

import { useState } from 'react';
import type { SuggestionSet } from '@/lib/analysis/suggestions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface SuggestionsListProps {
  suggestions: SuggestionSet;
}

/**
 * Actionable suggestions organized by timeframe
 */
export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [activeTab, setActiveTab] = useState<'immediate' | 'short-term' | 'long-term'>('immediate');
  const [expandedLearning, setExpandedLearning] = useState<Set<number>>(new Set());

  const activeSuggestions =
    activeTab === 'immediate'
      ? suggestions.immediate
      : activeTab === 'short-term'
        ? suggestions.shortTerm
        : suggestions.longTerm;

  const toggleLearning = (idx: number) => {
    const newSet = new Set(expandedLearning);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedLearning(newSet);
  };

  return (
    <div className="space-y-6">
      {/* Actionable Suggestions Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Actionable Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('immediate')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'immediate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Immediate ({suggestions.immediate.length})
            </button>
            <button
              onClick={() => setActiveTab('short-term')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'short-term'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Short-Term ({suggestions.shortTerm.length})
            </button>
            <button
              onClick={() => setActiveTab('long-term')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'long-term'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Long-Term ({suggestions.longTerm.length})
            </button>
          </div>

          {/* Suggestions List */}
          {activeSuggestions.length === 0 ? (
            <div className="rounded-lg bg-green-50 p-6 text-center">
              <div className="text-3xl">✨</div>
              <p className="mt-2 font-medium text-green-900">
                No {activeTab} suggestions!
              </p>
              <p className="mt-1 text-sm text-green-700">
                {activeTab === 'immediate'
                  ? 'All quick wins have been addressed. Great work!'
                  : activeTab === 'short-term'
                    ? 'Your build is well-optimized for the short term.'
                    : 'Your build is fully optimized for endgame!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSuggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.id}
                  className={`rounded-lg border-2 p-4 ${getPriorityBorderColor(suggestion.priority)}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-xs font-bold text-blue-700">
                            {idx + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getPriorityBadgeColor(suggestion.priority)}`}
                        >
                          {suggestion.priority} priority
                        </span>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {getCategoryLabel(suggestion.category)}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getDifficultyBadgeColor(suggestion.difficulty)}`}
                        >
                          {suggestion.difficulty}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getCostBadgeColor(suggestion.cost)}`}
                        >
                          {suggestion.cost} cost
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-700">{suggestion.description}</p>
                      <p className="mt-2 text-sm font-medium text-gray-800">
                        <strong>Benefit:</strong> {suggestion.benefit}
                      </p>
                    </div>

                    <div className="ml-4 rounded-lg bg-green-50 px-3 py-2 text-center">
                      <div className="text-xs text-green-700">Impact</div>
                      <div className="mt-1 text-sm font-bold text-green-800">
                        {suggestion.expectedImpact}
                      </div>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <h5 className="mb-2 text-sm font-semibold text-gray-900">
                      Action Steps:
                    </h5>
                    <ol className="space-y-2">
                      {suggestion.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2 text-sm">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {stepIdx + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-gray-700">{step.description}</span>
                            {step.tooltip && (
                              <p className="mt-1 text-xs text-gray-500">{step.tooltip}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Resources Card */}
      {suggestions.learning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📚 Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Understanding these concepts will help you optimize your build and make better
              decisions.
            </p>
            <div className="space-y-3">
              {suggestions.learning.map((learning, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white">
                  <button
                    onClick={() => toggleLearning(idx)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📖</div>
                      <span className="font-semibold text-gray-900">{learning.topic}</span>
                    </div>
                    <div className="text-gray-400">
                      {expandedLearning.has(idx) ? '−' : '+'}
                    </div>
                  </button>

                  {expandedLearning.has(idx) && (
                    <div className="border-t border-gray-200 p-4">
                      <p className="mb-3 text-sm text-gray-700">{learning.description}</p>
                      <div className="mb-3 rounded-lg bg-blue-50 p-3">
                        <p className="text-sm font-medium text-blue-900">
                          Why this matters:
                        </p>
                        <p className="mt-1 text-sm text-blue-800">{learning.why}</p>
                      </div>
                      {learning.resources.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold text-gray-700">
                            Resources:
                          </p>
                          <ul className="space-y-1">
                            {learning.resources.map((resource, resourceIdx) => (
                              <li
                                key={resourceIdx}
                                className="text-xs text-gray-600"
                              >
                                • {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getPriorityBorderColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'border-red-300 bg-red-50';
    case 'high':
      return 'border-orange-300 bg-orange-50';
    case 'medium':
      return 'border-blue-300 bg-blue-50';
    case 'low':
      return 'border-gray-300 bg-gray-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
}

function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getCostBadgeColor(cost: string): string {
  switch (cost) {
    case 'free':
      return 'bg-green-100 text-green-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

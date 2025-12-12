'use client';

import type { BottleneckAnalysis } from '@/lib/analysis/bottlenecks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface BottleneckCardProps {
  analysis: BottleneckAnalysis;
}

/**
 * Build grade and bottleneck overview
 */
export function BottleneckCard({ analysis }: BottleneckCardProps) {
  const { buildGrade, overallHealth, criticalBottlenecks, allBottlenecks, topPriority, summary } =
    analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Build Health Report</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Build Grade */}
        <div className="mb-6 flex items-center justify-between rounded-lg border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <div>
            <div className="text-sm font-medium text-gray-600">Build Grade</div>
            <p className="mt-1 text-xs text-gray-500">
              Based on damage, defense, and bottlenecks
            </p>
          </div>
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${getGradeBorderColor(buildGrade)} ${getGradeBgColor(buildGrade)}`}
          >
            <span className={`text-4xl font-bold ${getGradeTextColor(buildGrade)}`}>
              {buildGrade}
            </span>
          </div>
        </div>

        {/* Overall Health Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Health</span>
            <span className="text-sm font-semibold text-gray-900">{overallHealth}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${getHealthBarColor(overallHealth)}`}
              style={{ width: `${overallHealth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Build health factors in critical issues, high-priority bottlenecks, and medium concerns
          </p>
        </div>

        {/* Summary */}
        <div className={`mb-6 rounded-lg p-4 ${getSummaryBgColor(buildGrade)}`}>
          <p className="text-sm">{summary}</p>
        </div>

        {/* Critical Bottlenecks Alert */}
        {criticalBottlenecks.length > 0 && (
          <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-2xl">🚨</div>
              <div>
                <h4 className="font-semibold text-red-900">
                  {criticalBottlenecks.length} Critical Issue
                  {criticalBottlenecks.length > 1 ? 's' : ''} Detected
                </h4>
                <p className="mt-1 text-sm text-red-800">
                  These issues are severely limiting your build and should be addressed
                  immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Priority Bottleneck */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-gray-900">🎯 Top Priority Fix</h3>
          <div
            className={`rounded-lg border-2 p-4 ${getSeverityBorderColor(topPriority.severity)} ${getSeverityBgColor(topPriority.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{topPriority.title}</h4>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getSeverityBadgeColor(topPriority.severity)}`}
                  >
                    {topPriority.severity}
                  </span>
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {getCategoryLabel(topPriority.category)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{topPriority.description}</p>
                <p className="mt-2 text-sm font-medium text-gray-800">
                  <strong>Impact:</strong> {topPriority.impact}
                </p>
              </div>
              <div className="ml-4 rounded-lg bg-white px-4 py-2 text-center shadow-sm">
                <div className="text-xs text-gray-500">Estimated Gain</div>
                <div className="mt-1 font-bold text-green-600">
                  {topPriority.estimatedGain}
                </div>
              </div>
            </div>

            {/* Solutions */}
            {topPriority.solutions.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-2 text-sm font-semibold text-gray-900">How to Fix:</h5>
                {topPriority.solutions.map((solution, idx) => (
                  <div key={idx} className="mb-3 rounded-lg bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{solution.title}</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {solution.difficulty}
                      </span>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        {solution.cost} cost
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {solution.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-xs text-gray-600">
                          • {step}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs font-medium text-green-700">
                      ✓ {solution.expectedImprovement}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Bottlenecks Summary */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">
            All Identified Issues ({allBottlenecks.length})
          </h3>
          <div className="space-y-2">
            {allBottlenecks.slice(0, 5).map((bottleneck, idx) => (
              <div
                key={idx}
                className={`flex items-start justify-between rounded-lg border-l-4 p-3 ${getSeverityBorderColor(bottleneck.severity)} bg-gray-50`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-xs font-bold text-gray-700">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{bottleneck.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${getSeverityBadgeColor(bottleneck.severity)}`}
                      >
                        {bottleneck.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{bottleneck.description}</p>
                  </div>
                </div>
                <div className="ml-4 whitespace-nowrap text-right">
                  <div className="text-xs text-gray-500">Gain</div>
                  <div className="text-sm font-semibold text-green-600">
                    {bottleneck.estimatedGain}
                  </div>
                </div>
              </div>
            ))}
            {allBottlenecks.length > 5 && (
              <div className="text-center text-xs text-gray-500">
                + {allBottlenecks.length - 5} more issues
              </div>
            )}
          </div>
        </div>

        {/* Educational Footer */}
        {buildGrade === 'F' || buildGrade === 'D' ? (
          <div className="mt-6 rounded-lg bg-orange-50 p-4">
            <h4 className="mb-2 font-semibold text-orange-900">
              💡 Don&apos;t Get Discouraged!
            </h4>
            <p className="text-sm text-orange-800">
              Every build starts somewhere. Focus on fixing critical issues first - especially
              resistances and life. Each fix will make a huge difference in how the build feels!
            </p>
          </div>
        ) : buildGrade === 'S' || buildGrade === 'A' ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-green-900">🎉 Excellent Build!</h4>
            <p className="text-sm text-green-800">
              Your build is in great shape. At this point, focus on min-maxing gear, optimizing
              gems, and mastering boss mechanics to take on the hardest content.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function getGradeBorderColor(grade: string): string {
  switch (grade) {
    case 'S':
      return 'border-purple-500';
    case 'A':
      return 'border-green-500';
    case 'B':
      return 'border-blue-500';
    case 'C':
      return 'border-yellow-500';
    case 'D':
      return 'border-orange-500';
    case 'F':
      return 'border-red-500';
    default:
      return 'border-gray-500';
  }
}

function getGradeBgColor(grade: string): string {
  switch (grade) {
    case 'S':
      return 'bg-purple-100';
    case 'A':
      return 'bg-green-100';
    case 'B':
      return 'bg-blue-100';
    case 'C':
      return 'bg-yellow-100';
    case 'D':
      return 'bg-orange-100';
    case 'F':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}

function getGradeTextColor(grade: string): string {
  switch (grade) {
    case 'S':
      return 'text-purple-600';
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-orange-600';
    case 'F':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getHealthBarColor(health: number): string {
  if (health >= 80) return 'bg-green-500';
  if (health >= 60) return 'bg-blue-500';
  if (health >= 40) return 'bg-yellow-500';
  if (health >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

function getSummaryBgColor(grade: string): string {
  if (grade === 'S' || grade === 'A') return 'bg-green-50 text-green-800';
  if (grade === 'B' || grade === 'C') return 'bg-blue-50 text-blue-800';
  return 'bg-orange-50 text-orange-800';
}

function getSeverityBorderColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'border-l-red-500';
    case 'high':
      return 'border-l-orange-500';
    case 'medium':
      return 'border-l-blue-500';
    case 'low':
      return 'border-l-gray-500';
    default:
      return 'border-l-gray-500';
  }
}

function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-50';
    case 'high':
      return 'bg-orange-50';
    case 'medium':
      return 'bg-blue-50';
    case 'low':
      return 'bg-gray-50';
    default:
      return 'bg-gray-50';
  }
}

function getSeverityBadgeColor(severity: string): string {
  switch (severity) {
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

function getCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

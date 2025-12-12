'use client';

import type { DefenseAnalysis } from '@/lib/analysis/defense';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DefenseAnalysisProps {
  analysis: DefenseAnalysis;
}

/**
 * Visual defense layer analysis
 * Shows defense layers with status indicators
 */
export function DefenseAnalysis({ analysis }: DefenseAnalysisProps) {
  const { survivalRating, effectiveHP, defenseLayers, vulnerabilities, improvements, explanation } =
    analysis;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🛡️ Defense Analysis</CardTitle>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getSurvivalRatingColor(survivalRating)}`}>
              {survivalRating}
            </div>
            <div className="text-xs text-gray-500">Survival Rating</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Explanation */}
        <div className={`mb-6 rounded-lg p-4 ${getExplanationColor(survivalRating)}`}>
          <p className="text-sm">{explanation}</p>
        </div>

        {/* Effective HP */}
        <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">Effective Hit Points</div>
              <p className="mt-1 text-xs text-blue-700">
                Your actual survivability accounting for resistances and mitigation
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {effectiveHP.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
          </div>
        </div>

        {/* Defense Layers */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-gray-900">Defense Layers</h3>
          <div className="space-y-3">
            {defenseLayers.map((layer, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-l-4 p-4 ${getLayerBorderColor(layer.status)} ${getLayerBgColor(layer.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Layer Name & Status */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{layer.name}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(layer.status)}`}
                      >
                        {getStatusLabel(layer.status)}
                      </span>
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {getCategoryLabel(layer.category)}
                      </span>
                    </div>

                    {/* Current vs Benchmark */}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current: </span>
                        <span className="font-semibold text-gray-900">
                          {formatLayerValue(layer.currentValue, layer.category)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target: </span>
                        <span className="font-medium text-gray-700">
                          {formatLayerValue(layer.benchmarkValue, layer.category)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBarColor(layer.status)}`}
                          style={{
                            width: `${Math.min((layer.currentValue / layer.benchmarkValue) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <p className="mt-2 text-xs text-gray-600">{layer.explanation}</p>

                    {/* Sources */}
                    {layer.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {layer.sources.map((source, sourceIdx) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerabilities */}
        {vulnerabilities.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-900">⚠️ Vulnerabilities</h3>
            <div className="space-y-2">
              {vulnerabilities.map((vuln, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 ${getVulnBgColor(vuln.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${getVulnDotColor(vuln.severity)}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {getVulnTypeLabel(vuln.type)}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getSeverityBadgeColor(vuln.severity)}`}
                        >
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{vuln.description}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        <strong>Impact:</strong> {vuln.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Priorities */}
        {improvements.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              🎯 Improvement Priorities
            </h3>
            <div className="space-y-2">
              {improvements.slice(0, 3).map((improvement, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border-2 border-gray-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-xs font-bold text-blue-700">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {improvement.layer}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getPriorityBadgeColor(improvement.priority)}`}
                        >
                          {improvement.priority} priority
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{improvement.benefit}</p>
                      <ul className="mt-2 space-y-1">
                        {improvement.steps.slice(0, 2).map((step, stepIdx) => (
                          <li key={stepIdx} className="text-xs text-gray-600">
                            • {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-6 rounded-lg bg-green-50 p-4">
          <h4 className="mb-2 font-semibold text-green-900">💡 Defense Layering</h4>
          <p className="text-sm text-green-800">
            Effective defense requires multiple layers working together:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-green-700">
            <li>
              • <strong>Avoidance:</strong> Block, dodge, evasion (prevent hits entirely)
            </li>
            <li>
              • <strong>Mitigation:</strong> Resistances, armour (reduce damage taken)
            </li>
            <li>
              • <strong>EHP:</strong> Life, ES (absorb damage)
            </li>
            <li>
              • <strong>Recovery:</strong> Regen, leech, flasks (sustain through damage)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function getSurvivalRatingColor(rating: string): string {
  switch (rating) {
    case 'Critical':
      return 'text-red-600';
    case 'Weak':
      return 'text-orange-600';
    case 'Moderate':
      return 'text-yellow-600';
    case 'Strong':
      return 'text-blue-600';
    case 'Excellent':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

function getExplanationColor(rating: string): string {
  switch (rating) {
    case 'Critical':
      return 'bg-red-50 text-red-800';
    case 'Weak':
      return 'bg-orange-50 text-orange-800';
    case 'Moderate':
      return 'bg-yellow-50 text-yellow-800';
    case 'Strong':
      return 'bg-blue-50 text-blue-800';
    case 'Excellent':
      return 'bg-green-50 text-green-800';
    default:
      return 'bg-gray-50 text-gray-800';
  }
}

function getLayerBorderColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'border-l-red-500';
    case 'warning':
      return 'border-l-orange-500';
    case 'ok':
      return 'border-l-yellow-500';
    case 'good':
      return 'border-l-blue-500';
    case 'excellent':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-500';
  }
}

function getLayerBgColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'bg-red-50';
    case 'warning':
      return 'bg-orange-50';
    case 'ok':
      return 'bg-yellow-50';
    case 'good':
      return 'bg-blue-50';
    case 'excellent':
      return 'bg-green-50';
    default:
      return 'bg-gray-50';
  }
}

function getProgressBarColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-orange-500';
    case 'ok':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-blue-500';
    case 'excellent':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-orange-100 text-orange-800';
    case 'ok':
      return 'bg-yellow-100 text-yellow-800';
    case 'good':
      return 'bg-blue-100 text-blue-800';
    case 'excellent':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatLayerValue(value: number, category: string): string {
  if (category === 'mitigation' || category === 'avoidance') {
    return `${value.toFixed(0)}%`;
  }
  return value.toFixed(0);
}

function getVulnBgColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 border-l-4 border-l-red-500';
    case 'high':
      return 'bg-orange-50 border-l-4 border-l-orange-500';
    case 'medium':
      return 'bg-yellow-50 border-l-4 border-l-yellow-500';
    case 'low':
      return 'bg-blue-50 border-l-4 border-l-blue-500';
    default:
      return 'bg-gray-50 border-l-4 border-l-gray-500';
  }
}

function getVulnDotColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

function getSeverityBadgeColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getVulnTypeLabel(type: string): string {
  switch (type) {
    case 'physical':
      return 'Physical Damage Vulnerability';
    case 'elemental':
      return 'Elemental Damage Vulnerability';
    case 'chaos':
      return 'Chaos Damage Vulnerability';
    case 'dots':
      return 'Damage Over Time Vulnerability';
    case 'oneshots':
      return 'One-Shot Vulnerability';
    default:
      return type;
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

'use client';

import type { Recommendation } from '@/lib/coaching/types';
import { Alert } from '@/components/ui/Alert';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

/**
 * Display a single recommendation with appropriate styling
 */
export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const variantMap = {
    critical: 'error' as const,
    warning: 'warning' as const,
    suggestion: 'info' as const,
    info: 'info' as const,
  };

  const severityLabels = {
    critical: '🚨 Critical',
    warning: '⚠️ Warning',
    suggestion: '💡 Suggestion',
    info: '📘 Tip',
  };

  return (
    <Alert
      variant={variantMap[recommendation.severity]}
      title={`${severityLabels[recommendation.severity]}: ${recommendation.title}`}
    >
      <div className="space-y-3">
        <p className="text-sm">{recommendation.description}</p>

        <div className="border-l-2 border-gray-300 pl-3">
          <p className="text-sm font-medium text-gray-700">Why this matters:</p>
          <p className="text-sm text-gray-600">{recommendation.rationale}</p>
        </div>

        {recommendation.suggestedActions && recommendation.suggestedActions.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Suggested actions:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
              {recommendation.suggestedActions.map((action, idx) => (
                <li key={idx}>
                  <strong>{action.label}:</strong> {action.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.relatedResources && recommendation.relatedResources.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Learn more:</p>
            <ul className="mt-1 space-y-1">
              {recommendation.relatedResources.map((resource, idx) => (
                <li key={idx}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {resource.title} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Alert>
  );
}

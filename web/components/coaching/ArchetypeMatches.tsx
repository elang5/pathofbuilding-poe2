'use client';

import type { BuildAnalysis } from '@/lib/coaching/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ArchetypeMatchesProps {
  analysis: BuildAnalysis;
}

/**
 * Display matching build archetypes
 */
export function ArchetypeMatches({ analysis }: ArchetypeMatchesProps) {
  if (analysis.matchingArchetypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Build Archetype</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your build doesn&apos;t match any known meta archetypes. This could mean you&apos;re
            experimenting with a unique strategy!
          </p>
        </CardContent>
      </Card>
    );
  }

  const topMatch = analysis.matchingArchetypes[0];

  // This should never happen due to the check above, but TypeScript needs it
  if (!topMatch) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Archetype Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top Match */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-900">{topMatch.archetype.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="rounded bg-blue-200 px-2 py-0.5 font-medium text-blue-800">
                    Tier {topMatch.archetype.tier}
                  </span>
                  <span className="text-blue-700">{topMatch.archetype.popularity}% popularity</span>
                  <span className="text-blue-700">•</span>
                  <span className="text-blue-700 capitalize">{topMatch.archetype.difficulty}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{topMatch.matchScore}%</div>
                <div className="text-xs text-blue-700">Match</div>
              </div>
            </div>

            <p className="mb-3 text-sm text-blue-800">{topMatch.archetype.description}</p>

            {/* Match Reasons */}
            {topMatch.reasons.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-blue-900">Why this matches:</p>
                <ul className="space-y-0.5">
                  {topMatch.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-blue-800">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Archetype Details */}
            <div className="grid grid-cols-3 gap-3 border-t border-blue-200 pt-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">
                  {topMatch.archetype.clearSpeed}/10
                </div>
                <div className="text-xs text-blue-700">Clear Speed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">
                  {topMatch.archetype.bossing}/10
                </div>
                <div className="text-xs text-blue-700">Bossing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">
                  {topMatch.archetype.survivability}/10
                </div>
                <div className="text-xs text-blue-700">Survivability</div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3 border-t border-blue-200 pt-3">
              <p className="mb-1 text-xs font-medium text-blue-900">Recommended Skills:</p>
              <div className="flex flex-wrap gap-1">
                {topMatch.archetype.primarySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-2 flex items-center justify-between text-xs text-blue-800">
              <span>
                Budget:{' '}
                <span className="font-medium capitalize">{topMatch.archetype.budgetTier}</span>
              </span>
              <span>
                Min Level:{' '}
                <span className="font-medium">{topMatch.archetype.levelRequirement}</span>
              </span>
            </div>

            {/* Guide Link */}
            {topMatch.archetype.guideUrl && (
              <div className="mt-3 border-t border-blue-200 pt-3">
                <a
                  href={topMatch.archetype.guideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                >
                  View Full Build Guide →
                </a>
              </div>
            )}
          </div>

          {/* Other Matches */}
          {analysis.matchingArchetypes.length > 1 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Other Possible Archetypes:</h4>
              <div className="space-y-2">
                {analysis.matchingArchetypes.slice(1).map((match, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{match.archetype.name}</p>
                      <p className="text-xs text-gray-600">
                        Tier {match.archetype.tier} • {match.archetype.popularity}% popularity
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{match.matchScore}%</div>
                      <div className="text-xs text-gray-600">Match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

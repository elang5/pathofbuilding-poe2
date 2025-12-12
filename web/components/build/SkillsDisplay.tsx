'use client';

import type { SkillSet } from '@/lib/domain/skill';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface SkillsDisplayProps {
  skills: SkillSet;
}

/**
 * Display all skill groups and gems
 */
export function SkillsDisplay({ skills }: SkillsDisplayProps) {
  if (skills.skillGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No skills configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills ({skills.skillGroups.length} groups)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.skillGroups.map((group, idx) => (
            <div
              key={group.id}
              className={`rounded-lg border p-4 ${group.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
            >
              {/* Group Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    Skill Group {idx + 1}
                  </h3>
                  {group.slot && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {group.slot}
                    </span>
                  )}
                  {!group.enabled && (
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {group.gems.length} gem{group.gems.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Gems */}
              <div className="space-y-2">
                {group.gems.map((gem, gemIdx) => {
                  const isMainSkill = gemIdx === group.mainActiveSkillIndex;
                  const isSupport = gem.isSupport;

                  return (
                    <div
                      key={gemIdx}
                      className={`flex items-center justify-between rounded-md p-2 ${
                        !gem.enabled
                          ? 'bg-gray-100 opacity-60'
                          : isMainSkill
                            ? 'bg-yellow-100 border border-yellow-300'
                            : isSupport
                              ? 'bg-blue-50'
                              : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Gem Type Indicator */}
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isMainSkill
                              ? 'bg-yellow-500'
                              : isSupport
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                          }`}
                        />

                        {/* Gem Name */}
                        <span className="font-medium text-gray-900">
                          {gem.name || gem.gemId}
                        </span>

                        {/* Badges */}
                        {isMainSkill && (
                          <span className="rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
                            Main
                          </span>
                        )}
                        {isSupport && (
                          <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                            Support
                          </span>
                        )}
                        {!gem.enabled && (
                          <span className="rounded bg-gray-300 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                            Off
                          </span>
                        )}
                      </div>

                      {/* Gem Stats */}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Lvl {gem.level}</span>
                        {gem.quality > 0 && <span>Q{gem.quality}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Link Count */}
              {group.gems.length > 1 && (
                <div className="mt-2 text-right text-xs text-gray-500">
                  {group.gems.length}-link setup
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

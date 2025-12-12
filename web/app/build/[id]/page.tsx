/**
 * Build Display Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { BuildOverview } from '@/components/build/BuildOverview';
import { PassiveTreeSummary } from '@/components/build/PassiveTreeSummary';
import { ConfigDisplay } from '@/components/build/ConfigDisplay';
import { SkillsDisplay } from '@/components/build/SkillsDisplay';
import { ItemsDisplay } from '@/components/build/ItemsDisplay';
import { StatsEducational } from '@/components/build/StatsEducational';
import { CoachingSection } from '@/components/coaching/CoachingSection';
import { DamageBreakdown } from '@/components/analysis/DamageBreakdown';
import { DefenseAnalysis } from '@/components/analysis/DefenseAnalysis';
import { BottleneckCard } from '@/components/analysis/BottleneckCard';
import { SuggestionsList } from '@/components/analysis/SuggestionsList';
import { analyzeDamage } from '@/lib/analysis/damage';
import { analyzeDefense } from '@/lib/analysis/defense';
import { analyzeBottlenecks } from '@/lib/analysis/bottlenecks';
import { generateSuggestions } from '@/lib/analysis/suggestions';
import type { Build } from '@/lib/domain';

export default function BuildPage() {
  const router = useRouter();
  const params = useParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load build from localStorage
    const buildData = localStorage.getItem('currentBuild');

    if (!buildData) {
      setLoading(false);
      return;
    }

    try {
      const parsedBuild = JSON.parse(buildData);

      // Check if it matches the ID in the URL
      if (parsedBuild.id === params?.id) {
        // Convert Date strings back to Date objects
        parsedBuild.source.importedAt = new Date(parsedBuild.source.importedAt);

        // Convert arrays back to Set and Map
        parsedBuild.passiveTree.allocatedNodes = new Set(
          parsedBuild.passiveTree.allocatedNodes
        );
        parsedBuild.passiveTree.masterySelections = new Map(
          parsedBuild.passiveTree.masterySelections
        );
        parsedBuild.items.slots = new Map(parsedBuild.items.slots);

        setBuild(parsedBuild);
      }
    } catch (e) {
      console.error('Failed to load build:', e);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading build...</p>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Alert variant="warning" title="Build Not Found">
            <p>
              The build you&apos;re looking for could not be found. It may have been cleared
              from your browser&apos;s storage.
            </p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Import a Build
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // Run analysis on the build
  const damageAnalysis = analyzeDamage(build);
  const defenseAnalysis = analyzeDefense(build);
  const bottleneckAnalysis = analyzeBottlenecks(build);
  const suggestions = generateSuggestions(build);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="secondary" onClick={() => router.push('/')}>
            ← Back to Import
          </Button>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(build.source.pobCode);
                alert('PoB code copied to clipboard!');
              }}
            >
              Copy PoB Code
            </Button>
          </div>
        </div>

        {/* Build Content */}
        <div className="space-y-6">
          {/* Overview */}
          <BuildOverview build={build} />

          {/* Build Health Report - Top Priority */}
          <BottleneckCard analysis={bottleneckAnalysis} />

          {/* Two Column Layout - Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Damage Analysis */}
            <DamageBreakdown analysis={damageAnalysis} />

            {/* Defense Analysis */}
            <DefenseAnalysis analysis={defenseAnalysis} />
          </div>

          {/* Actionable Suggestions */}
          <SuggestionsList suggestions={suggestions} />

          {/* Educational Stats Breakdown */}
          <StatsEducational build={build} />

          {/* Two Column Layout - Passive Tree & Config */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Passive Tree */}
            <PassiveTreeSummary tree={build.passiveTree} />

            {/* Configuration */}
            <ConfigDisplay config={build.config} />
          </div>

          {/* Skills */}
          <SkillsDisplay skills={build.skills} />

          {/* Items */}
          <ItemsDisplay items={build.items} />

          {/* Build Coach */}
          <CoachingSection build={build} />
        </div>
      </div>
    </div>
  );
}

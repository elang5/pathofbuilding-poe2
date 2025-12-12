/**
 * Home / Import Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PobCodeInput } from '@/components/import/PobCodeInput';
import type { Build } from '@/lib/domain';

export default function HomePage() {
  const router = useRouter();
  const [, setImportedBuild] = useState<Build | null>(null);

  const handleBuildImported = (build: Build) => {
    setImportedBuild(build);

    // Store in localStorage for now (will add proper state management later)
    localStorage.setItem('currentBuild', JSON.stringify(build));

    // Navigate to build view
    router.push(`/build/${build.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">PoE2 Build Coach</h1>
          <p className="mt-2 text-lg text-gray-600">Educational companion for Path of Building 2</p>
          <p className="mt-1 text-sm text-gray-500">
            Import your build and understand how it works
          </p>
        </div>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle>Import Your Build</CardTitle>
          </CardHeader>
          <CardContent>
            <PobCodeInput onBuildImported={handleBuildImported} />
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🔍"
            title="Understand Your Build"
            description="See how your damage scales and where your defenses come from"
          />
          <FeatureCard
            icon="📊"
            title="Find Bottlenecks"
            description="Identify what's holding your build back and how to improve it"
          />
          <FeatureCard
            icon="🎓"
            title="Learn Build Theory"
            description="Educational explanations for every stat and mechanic"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

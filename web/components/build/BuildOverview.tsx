/**
 * Build Overview Component
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Build } from '@/lib/domain';

interface BuildOverviewProps {
  build: Build;
}

export function BuildOverview({ build }: BuildOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{build.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox label="Level" value={build.level} />
          <StatBox label="Class" value={build.className} />
          <StatBox
            label="Ascendancy"
            value={build.ascendancy || 'None'}
            subdued={!build.ascendancy}
          />
          <StatBox label="Version" value={build.version} />
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Imported {new Date(build.source.importedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({
  label,
  value,
  subdued = false,
}: {
  label: string;
  value: string | number;
  subdued?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${subdued ? 'text-gray-400' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

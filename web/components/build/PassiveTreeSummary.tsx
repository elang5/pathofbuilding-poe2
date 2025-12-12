/**
 * Passive Tree Summary Component
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { PassiveTreeSpec } from '@/lib/domain';

interface PassiveTreeSummaryProps {
  tree: PassiveTreeSpec;
}

export function PassiveTreeSummary({ tree }: PassiveTreeSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passive Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatRow label="Allocated Nodes" value={tree.allocatedNodes.size} />
            <StatRow label="Total Points" value={tree.totalPoints} />
            <StatRow label="Jewel Sockets" value={tree.jewelSockets.length} />
          </div>

          {/* Tree Version */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm text-gray-600">
              Tree Version: <span className="font-mono font-semibold text-gray-900">{tree.version}</span>
            </div>
          </div>

          {/* Jewel Sockets */}
          {tree.jewelSockets.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Jewel Sockets</h4>
              <div className="space-y-2">
                {tree.jewelSockets.map((socket, idx) => (
                  <div
                    key={socket.nodeId}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Socket {idx + 1}</span>
                      <span className="ml-2 text-gray-500">Node #{socket.nodeId}</span>
                    </div>
                    <div
                      className={`text-sm ${socket.itemId ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {socket.itemId ? `Item #${socket.itemId}` : 'Empty'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Nodes (first 10) */}
          {tree.allocatedNodes.size > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Allocated Nodes (showing first 10 of {tree.allocatedNodes.size})
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(tree.allocatedNodes)
                  .slice(0, 10)
                  .map((nodeId) => (
                    <span
                      key={nodeId}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                    >
                      #{nodeId}
                    </span>
                  ))}
                {tree.allocatedNodes.size > 10 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    +{tree.allocatedNodes.size - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
  );
}

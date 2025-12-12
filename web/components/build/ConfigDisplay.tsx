/**
 * Build Configuration Display Component
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { BuildConfig } from '@/lib/domain';

interface ConfigDisplayProps {
  config: BuildConfig;
}

export function ConfigDisplay({ config }: ConfigDisplayProps) {
  const hasConfig =
    config.enemyLevel !== undefined ||
    config.enemyIsBoss !== undefined ||
    config.usePowerCharges !== undefined ||
    config.useFrenzyCharges !== undefined ||
    config.useEnduranceCharges !== undefined ||
    (config.customConfig && Object.keys(config.customConfig).length > 0);

  if (!hasConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Build Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No configuration settings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Enemy Settings */}
          {(config.enemyLevel !== undefined || config.enemyIsBoss !== undefined) && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Enemy Settings</h4>
              <div className="space-y-2">
                {config.enemyLevel !== undefined && (
                  <ConfigRow label="Enemy Level" value={config.enemyLevel} />
                )}
                {config.enemyIsBoss !== undefined && (
                  <ConfigRow label="Is Boss" value={config.enemyIsBoss ? 'Yes' : 'No'} />
                )}
              </div>
            </div>
          )}

          {/* Charges */}
          {(config.usePowerCharges !== undefined ||
            config.useFrenzyCharges !== undefined ||
            config.useEnduranceCharges !== undefined) && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Charges</h4>
              <div className="space-y-2">
                {config.usePowerCharges !== undefined && (
                  <ConfigRow
                    label="Power Charges"
                    value={config.usePowerCharges ? 'Enabled' : 'Disabled'}
                    variant={config.usePowerCharges ? 'success' : 'neutral'}
                  />
                )}
                {config.useFrenzyCharges !== undefined && (
                  <ConfigRow
                    label="Frenzy Charges"
                    value={config.useFrenzyCharges ? 'Enabled' : 'Disabled'}
                    variant={config.useFrenzyCharges ? 'success' : 'neutral'}
                  />
                )}
                {config.useEnduranceCharges !== undefined && (
                  <ConfigRow
                    label="Endurance Charges"
                    value={config.useEnduranceCharges ? 'Enabled' : 'Disabled'}
                    variant={config.useEnduranceCharges ? 'success' : 'neutral'}
                  />
                )}
              </div>
            </div>
          )}

          {/* Custom Config */}
          {config.customConfig && Object.keys(config.customConfig).length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Custom Settings</h4>
              <div className="space-y-2">
                {Object.entries(config.customConfig).map(([key, value]) => (
                  <ConfigRow key={key} label={key} value={String(value)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigRow({
  label,
  value,
  variant = 'neutral',
}: {
  label: string;
  value: string | number;
  variant?: 'neutral' | 'success';
}) {
  const variantStyles = {
    neutral: 'bg-gray-50 text-gray-900',
    success: 'bg-green-50 text-green-900',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${variantStyles[variant]}`}>
        {value}
      </span>
    </div>
  );
}

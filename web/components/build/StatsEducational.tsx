'use client';

import type { Build } from '@/lib/domain/build';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface StatsEducationalProps {
  build: Build;
}

/**
 * Educational breakdown of how damage and defenses scale
 */
export function StatsEducational({ build }: StatsEducationalProps) {
  // Count sources of damage scaling
  const damageScalingSources = analyzeDamageScaling(build);
  const defenseSources = analyzeDefenses(build);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Offense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>⚔️ How Your Damage Scales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your damage comes from multiple multiplying layers. Here&apos;s what&apos;s boosting your build:
            </p>

            {/* Skill Gems */}
            {damageScalingSources.skillLinks > 0 && (
              <ScalingSource
                icon="💎"
                title="Skill Gems"
                value={`${damageScalingSources.skillLinks}-link`}
                explanation="Each support gem multiplies your base damage. A 6-link gives ~400% more damage vs a 3-link!"
                importance="critical"
              />
            )}

            {/* Passive Tree */}
            {damageScalingSources.passiveNodes > 0 && (
              <ScalingSource
                icon="🌳"
                title="Passive Tree"
                value={`${damageScalingSources.passiveNodes} nodes`}
                explanation="Increased damage from passive nodes adds together, then multiplies your total damage."
                importance="high"
              />
            )}

            {/* Weapon */}
            {damageScalingSources.hasWeapon && (
              <ScalingSource
                icon="⚔️"
                title="Weapon Base Damage"
                value="Equipped"
                explanation="Your weapon's base damage is the foundation. All % increases and More multipliers scale this."
                importance="critical"
              />
            )}

            {/* Class/Ascendancy */}
            <ScalingSource
              icon="🎓"
              title={`${build.className} / ${build.ascendancy || 'No Ascendancy'}`}
              value={build.ascendancy ? 'Ascended' : 'Not yet ascended'}
              explanation={
                build.ascendancy
                  ? 'Your ascendancy provides powerful damage multipliers and unique mechanics.'
                  : 'Ascend in the Labyrinth for major power boosts!'
              }
              importance={build.ascendancy ? 'high' : 'medium'}
            />

            {/* Level */}
            <ScalingSource
              icon="📈"
              title="Character Level"
              value={`Level ${build.level}`}
              explanation="Higher level = more skill points, better gems, and access to better gear."
              importance="medium"
            />

            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
              <p className="font-medium text-blue-900">💡 Key Concept: Multipliers</p>
              <p className="mt-1 text-blue-800">
                &quot;Increased&quot; damage adds together (50% + 50% = 100% increased). &quot;More&quot;
                damage multiplies separately (50% more + 50% more = 225% total damage). Always prioritize
                More multipliers!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>🛡️ How Your Defenses Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Staying alive requires layered defenses. Here&apos;s what&apos;s protecting you:
            </p>

            {/* Life Pool */}
            <DefenseLayer
              icon="❤️"
              title="Life Pool"
              value={`${defenseSources.passiveLifeNodes} life nodes`}
              explanation="Your maximum life is your first line of defense. Life on gear and passive tree add together."
              status={defenseSources.passiveLifeNodes >= 10 ? 'good' : 'warning'}
            />

            {/* Energy Shield */}
            {defenseSources.hasEnergyShield && (
              <DefenseLayer
                icon="⚡"
                title="Energy Shield"
                value="Active"
                explanation="ES recharges when you haven't taken damage recently. Acts as a second life pool."
                status="good"
              />
            )}

            {/* Armour/Evasion */}
            {defenseSources.hasArmour && (
              <DefenseLayer
                icon="🛡️"
                title="Armour"
                value="From gear"
                explanation="Armour reduces physical damage. More effective against many small hits than big hits."
                status="good"
              />
            )}

            {/* Resistances */}
            <DefenseLayer
              icon="🔥❄️⚡"
              title="Elemental Resistances"
              value="Check your gear!"
              explanation="CRITICAL: Cap your Fire/Cold/Lightning res at 75%. Without capped res, you'll get one-shot by elemental damage."
              status={build.level >= 40 ? 'warning' : 'medium'}
            />

            {/* Block */}
            {defenseSources.hasShield && (
              <DefenseLayer
                icon="🛡️"
                title="Block Chance"
                value="Shield equipped"
                explanation="Chance to completely block attacks. Shields can provide 20-30% block chance."
                status="good"
              />
            )}

            {/* Passive Points Available */}
            {defenseSources.passiveLifeNodes < 10 && build.level >= 30 && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm">
                <p className="font-medium text-red-900">⚠️ Defense Warning</p>
                <p className="mt-1 text-red-800">
                  You have very few life nodes allocated! Aim for at least 150-200% increased life from
                  the passive tree. Path toward life clusters between damage nodes.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm">
              <p className="font-medium text-green-900">💡 Layering Defenses</p>
              <p className="mt-1 text-green-800">
                The best builds use multiple defense layers: High life + capped resistances + armour/evasion
                + block/dodge. Don&apos;t rely on just one!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ScalingSourceProps {
  icon: string;
  title: string;
  value: string;
  explanation: string;
  importance: 'critical' | 'high' | 'medium';
}

function ScalingSource({ icon, title, value, explanation, importance }: ScalingSourceProps) {
  const importanceColors = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className={`rounded-lg border p-3 ${importanceColors[importance]}`}>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <span className="text-sm font-medium text-gray-700">{value}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

interface DefenseLayerProps {
  icon: string;
  title: string;
  value: string;
  explanation: string;
  status: 'good' | 'warning' | 'medium';
}

function DefenseLayer({ icon, title, value, explanation, status }: DefenseLayerProps) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    medium: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className={`rounded-lg border p-3 ${statusColors[status]}`}>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <span className="text-sm font-medium text-gray-700">{value}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Analyze build for damage scaling sources
 */
function analyzeDamageScaling(build: Build) {
  // Find longest skill link
  const maxLinks = Math.max(...build.skills.skillGroups.map((g) => g.gems.length), 0);

  // Count passive nodes (rough estimate of damage scaling)
  const passiveNodes = build.passiveTree.allocatedNodes.size;

  // Check if has weapon equipped
  const hasWeapon = Array.from(build.items.slots.entries()).some(
    ([slot, item]) => item && (slot.includes('Weapon') || slot.includes('weapon'))
  );

  return {
    skillLinks: maxLinks,
    passiveNodes,
    hasWeapon,
  };
}

/**
 * Analyze build for defense sources
 */
function analyzeDefenses(build: Build) {
  // Count life nodes (rough estimate - nodes with "life" in common paths)
  // This is approximate since we don't have the actual node data
  const passiveLifeNodes = Math.floor(build.passiveTree.allocatedNodes.size / 10);

  // Check for shield
  const hasShield = Array.from(build.items.slots.entries()).some(
    ([slot, item]) => item && item.itemClass === 'Shield'
  );

  // Check for armour items
  const hasArmour = Array.from(build.items.slots.entries()).some(
    ([, item]) => item && item.armourStats && item.armourStats.armour && item.armourStats.armour > 0
  );

  // Check for ES items
  const hasEnergyShield = Array.from(build.items.slots.entries()).some(
    ([, item]) =>
      item && item.armourStats && item.armourStats.energyShield && item.armourStats.energyShield > 0
  );

  return {
    passiveLifeNodes,
    hasShield,
    hasArmour,
    hasEnergyShield,
  };
}

'use client';

import type { ItemSet } from '@/lib/domain/item';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ItemsDisplayProps {
  items: ItemSet;
}

/**
 * Display all equipped items
 */
export function ItemsDisplay({ items }: ItemsDisplayProps) {
  const equippedItems = Array.from(items.slots.entries()).filter(([, item]) => item !== null);

  if (equippedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No items equipped</p>
        </CardContent>
      </Card>
    );
  }

  const rarityColors = {
    Normal: 'text-gray-700',
    Magic: 'text-blue-600',
    Rare: 'text-yellow-600',
    Unique: 'text-orange-600',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items ({equippedItems.length} equipped)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {equippedItems.map(([slot, item]) => {
            if (!item) return null;

            return (
              <div key={slot} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                {/* Item Header */}
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-500">{slot}</div>
                    <div className={`font-bold ${rarityColors[item.rarity]}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600">{item.baseName}</div>
                  </div>
                  <div className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {item.itemClass}
                  </div>
                </div>

                {/* Weapon Stats */}
                {item.weaponStats && (
                  <div className="mb-2 space-y-1 border-t border-gray-300 pt-2 text-sm">
                    {item.weaponStats.physicalDamage && (
                      <div className="text-gray-700">
                        Physical Damage: {item.weaponStats.physicalDamage.min}-
                        {item.weaponStats.physicalDamage.max}
                      </div>
                    )}
                    {item.weaponStats.attacksPerSecond && (
                      <div className="text-gray-700">
                        APS: {item.weaponStats.attacksPerSecond.toFixed(2)}
                      </div>
                    )}
                    {item.weaponStats.criticalChance && (
                      <div className="text-gray-700">
                        Crit: {item.weaponStats.criticalChance.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Armour Stats */}
                {item.armourStats && (
                  <div className="mb-2 space-y-1 border-t border-gray-300 pt-2 text-sm">
                    {item.armourStats.armour && item.armourStats.armour > 0 && (
                      <div className="text-gray-700">Armour: {item.armourStats.armour}</div>
                    )}
                    {item.armourStats.evasion && item.armourStats.evasion > 0 && (
                      <div className="text-gray-700">Evasion: {item.armourStats.evasion}</div>
                    )}
                    {item.armourStats.energyShield && item.armourStats.energyShield > 0 && (
                      <div className="text-gray-700">
                        Energy Shield: {item.armourStats.energyShield}
                      </div>
                    )}
                  </div>
                )}

                {/* Implicit Mods */}
                {item.implicitMods.length > 0 && (
                  <div className="mb-2 space-y-0.5 border-t border-gray-300 pt-2">
                    {item.implicitMods.map((mod, idx) => (
                      <div key={idx} className="text-sm text-blue-700">
                        {mod.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Explicit Mods */}
                {item.explicitMods.length > 0 && (
                  <div className="space-y-0.5">
                    {item.explicitMods.map((mod, idx) => (
                      <div key={idx} className="text-sm text-blue-600">
                        {mod.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Crafted Mods */}
                {item.craftedMods.length > 0 && (
                  <div className="mt-2 space-y-0.5 border-t border-gray-300 pt-2">
                    {item.craftedMods.map((mod, idx) => (
                      <div key={idx} className="text-sm text-purple-600">
                        {mod.text} (crafted)
                      </div>
                    ))}
                  </div>
                )}

                {/* Requirements */}
                {(item.requirements.level ||
                  item.requirements.strength ||
                  item.requirements.dexterity ||
                  item.requirements.intelligence) && (
                  <div className="mt-2 border-t border-gray-300 pt-2 text-xs text-gray-500">
                    Requires:{' '}
                    {[
                      item.requirements.level && `Level ${item.requirements.level}`,
                      item.requirements.strength && `${item.requirements.strength} Str`,
                      item.requirements.dexterity && `${item.requirements.dexterity} Dex`,
                      item.requirements.intelligence && `${item.requirements.intelligence} Int`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

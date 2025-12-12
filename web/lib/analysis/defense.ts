/**
 * Defense Analysis Module
 *
 * Analyzes defensive layers and identifies vulnerabilities:
 * Avoidance → Mitigation → Recovery → EHP
 */

import type { Build } from '../domain/build';

export interface DefenseAnalysis {
  survivalRating: 'Critical' | 'Weak' | 'Moderate' | 'Strong' | 'Excellent';
  effectiveHP: number;

  // Defense layers
  defenseLayers: DefenseLayer[];

  // Vulnerabilities
  vulnerabilities: Vulnerability[];

  // Improvements
  improvements: DefenseImprovement[];

  // Educational content
  explanation: string;
}

export interface DefenseLayer {
  name: string;
  category: 'avoidance' | 'mitigation' | 'recovery' | 'ehp';
  status: 'critical' | 'warning' | 'ok' | 'good' | 'excellent';
  currentValue: number;
  benchmarkValue: number;
  sources: string[];
  explanation: string;
}

export interface Vulnerability {
  type: 'physical' | 'elemental' | 'chaos' | 'dots' | 'oneshots';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

export interface DefenseImprovement {
  layer: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentValue: number;
  targetValue: number;
  benefit: string;
  steps: string[];
}

/**
 * Analyzes defensive layers for a build
 */
export function analyzeDefense(build: Build): DefenseAnalysis {
  const defenseLayers = createDefenseLayerAnalysis(build);
  const vulnerabilities = identifyVulnerabilities(build, defenseLayers);
  const improvements = suggestDefenseImprovements(build, defenseLayers, vulnerabilities);
  const effectiveHP = calculateEffectiveHP(build, defenseLayers);
  const survivalRating = calculateSurvivalRating(effectiveHP, vulnerabilities);
  const explanation = generateDefenseExplanation(build, survivalRating, vulnerabilities);

  return {
    survivalRating,
    effectiveHP,
    defenseLayers,
    vulnerabilities,
    improvements,
    explanation,
  };
}

/**
 * Creates layer-by-layer defense analysis
 */
export function createDefenseLayerAnalysis(build: Build): DefenseLayer[] {
  const layers: DefenseLayer[] = [];

  // Layer 1: Life Pool
  const life = estimateLife(build);
  layers.push({
    name: 'Life Pool',
    category: 'ehp',
    status: getLifeStatus(life, build.level),
    currentValue: life,
    benchmarkValue: build.level * 12, // ~12 life per level is reasonable
    sources: ['Base life', 'Life on gear', 'Life nodes on tree'],
    explanation: `Your maximum life is ${life.toFixed(0)}. This is your primary defense pool that must be recovered when hit.`,
  });

  // Layer 2: Energy Shield (if present)
  const es = estimateEnergyShield(build);
  if (es > 0) {
    layers.push({
      name: 'Energy Shield',
      category: 'ehp',
      status: getESStatus(es, build.level),
      currentValue: es,
      benchmarkValue: build.level * 15,
      sources: ['ES on gear', 'ES nodes on tree', 'Intelligence'],
      explanation: `Energy Shield provides ${es.toFixed(0)} additional hit points that regenerate when you haven't been hit recently.`,
    });
  }

  // Layer 3: Elemental Resistances
  const elementalRes = estimateElementalResistances(build);
  layers.push({
    name: 'Elemental Resistances',
    category: 'mitigation',
    status: getResistanceStatus(elementalRes),
    currentValue: elementalRes,
    benchmarkValue: 75, // Resist cap
    sources: ['Resist mods on gear', 'Passive tree', 'Purity auras'],
    explanation: `Your average elemental resistance is ${elementalRes.toFixed(0)}%. CRITICAL: You should cap Fire/Cold/Lightning at 75% in maps.`,
  });

  // Layer 4: Chaos Resistance
  const chaosRes = estimateChaosResistance(build);
  layers.push({
    name: 'Chaos Resistance',
    category: 'mitigation',
    status: getChaosResStatus(chaosRes),
    currentValue: chaosRes,
    benchmarkValue: 0, // Chaos res starts at -60%, getting to 0% is good
    sources: ['Chaos res on gear', 'Passive tree'],
    explanation: `Chaos resistance is ${chaosRes.toFixed(0)}%. Unlike elemental damage, chaos bypasses ES and many builds ignore it early.`,
  });

  // Layer 5: Armour (if present)
  const armour = estimateArmour(build);
  if (armour > 0) {
    layers.push({
      name: 'Armour',
      category: 'mitigation',
      status: getArmourStatus(armour),
      currentValue: armour,
      benchmarkValue: 20000,
      sources: ['Armour on gear', 'Armour nodes', 'Determination aura'],
      explanation: `Armour (${armour.toFixed(0)}) reduces physical damage from hits. More effective against many small hits than one big hit.`,
    });
  }

  // Layer 6: Evasion (if present)
  const evasion = estimateEvasion(build);
  if (evasion > 0) {
    layers.push({
      name: 'Evasion',
      category: 'avoidance',
      status: getEvasionStatus(evasion),
      currentValue: evasion,
      benchmarkValue: 20000,
      sources: ['Evasion on gear', 'Evasion nodes', 'Grace aura'],
      explanation: `Evasion (${evasion.toFixed(0)}) gives you a chance to avoid attacks entirely. Works with entropy - you won't dodge forever!`,
    });
  }

  // Layer 7: Block
  const blockChance = estimateBlockChance(build);
  if (blockChance > 0) {
    layers.push({
      name: 'Block Chance',
      category: 'avoidance',
      status: getBlockStatus(blockChance),
      currentValue: blockChance,
      benchmarkValue: 75, // Block cap
      sources: ['Shield', 'Block nodes', 'Dual wield'],
      explanation: `${blockChance.toFixed(0)}% chance to block attacks. Block prevents all damage and effects from a hit.`,
    });
  }

  // Layer 8: Life Regeneration
  const lifeRegen = estimateLifeRegen(build);
  layers.push({
    name: 'Life Regeneration',
    category: 'recovery',
    status: getRegenStatus(lifeRegen, life),
    currentValue: lifeRegen,
    benchmarkValue: life * 0.05, // 5% of max life per second is solid
    sources: ['Life regen on gear', 'Regen nodes', 'Vitality aura'],
    explanation: `Regenerating ${lifeRegen.toFixed(1)} life/sec (${((lifeRegen / life) * 100).toFixed(1)}% of max life). Helps with DoTs and sustained damage.`,
  });

  return layers;
}

/**
 * Identifies defensive vulnerabilities
 */
export function identifyVulnerabilities(
  build: Build,
  layers: DefenseLayer[]
): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];

  // Check elemental resistance
  const elementalRes = layers.find((l) => l.name === 'Elemental Resistances');
  if (elementalRes && elementalRes.currentValue < 75) {
    vulnerabilities.push({
      type: 'elemental',
      severity: elementalRes.currentValue < 0 ? 'critical' : elementalRes.currentValue < 50 ? 'high' : 'medium',
      description: `Elemental resistances are only ${elementalRes.currentValue.toFixed(0)}%`,
      impact: 'You will take significantly more elemental damage. This is the #1 priority to fix.',
    });
  }

  // Check life pool
  const lifeLayer = layers.find((l) => l.name === 'Life Pool');
  if (lifeLayer && lifeLayer.status === 'critical') {
    vulnerabilities.push({
      type: 'oneshots',
      severity: 'high',
      description: `Life pool is only ${lifeLayer.currentValue.toFixed(0)}`,
      impact: 'You are vulnerable to one-shots from bosses and hard-hitting enemies.',
    });
  }

  // Check chaos resistance
  const chaosRes = layers.find((l) => l.name === 'Chaos Resistance');
  if (chaosRes && chaosRes.currentValue < -30) {
    vulnerabilities.push({
      type: 'chaos',
      severity: chaosRes.currentValue < -50 ? 'high' : 'medium',
      description: `Chaos resistance is ${chaosRes.currentValue.toFixed(0)}%`,
      impact: 'Chaos damage bypasses Energy Shield and will chunk your life pool.',
    });
  }

  // Check mitigation layers
  const armour = layers.find((l) => l.name === 'Armour');
  const evasion = layers.find((l) => l.name === 'Evasion');
  const blockChance = layers.find((l) => l.name === 'Block Chance');

  const hasMitigation =
    (armour && armour.currentValue > 5000) ||
    (evasion && evasion.currentValue > 5000) ||
    (blockChance && blockChance.currentValue > 30);

  if (!hasMitigation) {
    vulnerabilities.push({
      type: 'physical',
      severity: 'high',
      description: 'No significant physical mitigation or avoidance',
      impact: 'Physical attacks will deal full damage to your life pool.',
    });
  }

  // Check recovery
  const regen = layers.find((l) => l.name === 'Life Regeneration');
  if (lifeLayer && regen && regen.currentValue < lifeLayer.currentValue * 0.02) {
    vulnerabilities.push({
      type: 'dots',
      severity: 'medium',
      description: `Life regeneration is only ${regen.currentValue.toFixed(1)}/sec`,
      impact: 'Damage over time effects and ground degens will be very dangerous.',
    });
  }

  return vulnerabilities.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Suggests improvements to defenses
 */
export function suggestDefenseImprovements(
  build: Build,
  layers: DefenseLayer[],
  vulnerabilities: Vulnerability[]
): DefenseImprovement[] {
  const improvements: DefenseImprovement[] = [];

  // Prioritize based on vulnerabilities
  for (const vuln of vulnerabilities) {
    if (vuln.type === 'elemental' && vuln.severity === 'critical') {
      const resLayer = layers.find((l) => l.name === 'Elemental Resistances');
      if (resLayer) {
        improvements.push({
          layer: 'Elemental Resistances',
          priority: 'critical',
          currentValue: resLayer.currentValue,
          targetValue: 75,
          benefit: 'Capping your resistances will reduce elemental damage by 75%',
          steps: [
            'Get resist mods on rare rings and amulet',
            'Look for resist suffixes on body armour and boots',
            'Allocate resist nodes near your path on passive tree',
            'Use Purity of Elements aura if desperate',
          ],
        });
      }
    }

    if (vuln.type === 'oneshots' && vuln.severity === 'high') {
      const lifeLayer = layers.find((l) => l.name === 'Life Pool');
      if (lifeLayer) {
        improvements.push({
          layer: 'Life Pool',
          priority: 'high',
          currentValue: lifeLayer.currentValue,
          targetValue: lifeLayer.benchmarkValue,
          benefit: `Increasing life to ${lifeLayer.benchmarkValue.toFixed(0)} will significantly reduce one-shot risk`,
          steps: [
            'Get maximum life on every rare item (rings, amulet, belt, chest)',
            'Allocate life wheel on passive tree',
            'Consider life-focused jewels in sockets',
            'Level up - you gain base life per level',
          ],
        });
      }
    }

    if (vuln.type === 'physical') {
      improvements.push({
        layer: 'Physical Mitigation',
        priority: 'high',
        currentValue: 0,
        targetValue: 20000,
        benefit: 'Adding armour or evasion will dramatically improve physical damage survival',
        steps: [
          'If strength-based: Stack armour on gear, use Determination aura',
          'If dexterity-based: Stack evasion on gear, use Grace aura',
          'Consider using a shield for block chance',
          'Look for Endurance Charges (reduce physical damage taken)',
        ],
      });
    }
  }

  // Add general improvements for weak layers
  for (const layer of layers) {
    if (layer.status === 'warning' || layer.status === 'critical') {
      const alreadyImproved = improvements.find((i) => i.layer === layer.name);
      if (!alreadyImproved) {
        improvements.push({
          layer: layer.name,
          priority: layer.status === 'critical' ? 'high' : 'medium',
          currentValue: layer.currentValue,
          targetValue: layer.benchmarkValue,
          benefit: `Improving ${layer.name} will shore up a defensive weakness`,
          steps: [`Consult the specific recommendations for ${layer.name} above`],
        });
      }
    }
  }

  return improvements.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Helper functions for estimation

function estimateLife(build: Build): number {
  // Base life from level
  const baseLife = 38 + build.level * 12; // Characters start with ~50 life at level 1

  // Life from strength (2 life per 10 str)
  const strLife = 0; // We don't have attribute data yet

  // Life from tree (estimate 5% per node)
  const treeLife = build.passiveTree.allocatedNodes.size * 0.05;

  // Life from gear (rough estimate)
  const gearLife = Array.from(build.items.slots.values()).reduce((sum, item) => {
    if (!item) return sum;
    // Rough heuristic: rare items can have 60-100 life
    return sum + (item.rarity === 'Rare' ? 70 : 0);
  }, 0);

  return baseLife * (1 + treeLife) + gearLife;
}

function estimateEnergyShield(build: Build): number {
  // Check for ES gear
  const esGear = Array.from(build.items.slots.values()).filter(
    (item) => item?.armourStats?.energyShield && item.armourStats.energyShield > 0
  );

  if (esGear.length === 0) return 0;

  // Sum ES from gear
  const baseES = esGear.reduce((sum, item) => sum + (item?.armourStats?.energyShield || 0), 0);

  // ES from tree
  const treeESInc = build.passiveTree.allocatedNodes.size * 0.03; // 3% per node estimate

  return baseES * (1 + treeESInc);
}

function estimateElementalResistances(build: Build): number {
  // Rough estimate based on gear
  const gearPieces = Array.from(build.items.slots.values()).filter((item) => item !== null).length;

  // Assume 10% per gear piece (very rough)
  const baseRes = Math.min(gearPieces * 10, 135); // Cap at 135 (overcapped)

  // Tree provides some
  const treeRes = build.passiveTree.allocatedNodes.size * 0.5;

  return Math.min(baseRes + treeRes, 75); // Game caps at 75%
}

function estimateChaosResistance(build: Build): number {
  // Most builds start at -60% chaos res
  const baseRes = -60;

  // Gear and tree
  const gearRes = Array.from(build.items.slots.values()).filter((item) => item !== null).length * 5;
  const treeRes = build.passiveTree.allocatedNodes.size * 0.3;

  return Math.min(baseRes + gearRes + treeRes, 75);
}

function estimateArmour(build: Build): number {
  // Check for armour gear
  const armourGear = Array.from(build.items.slots.values()).filter(
    (item) => item?.armourStats?.armour && item.armourStats.armour > 0
  );

  if (armourGear.length === 0) return 0;

  const baseArmour = armourGear.reduce((sum, item) => sum + (item?.armourStats?.armour || 0), 0);
  const treeInc = build.passiveTree.allocatedNodes.size * 0.04; // 4% per node

  return baseArmour * (1 + treeInc);
}

function estimateEvasion(build: Build): number {
  const evasionGear = Array.from(build.items.slots.values()).filter(
    (item) => item?.armourStats?.evasion && item.armourStats.evasion > 0
  );

  if (evasionGear.length === 0) return 0;

  const baseEvasion = evasionGear.reduce((sum, item) => sum + (item?.armourStats?.evasion || 0), 0);
  const treeInc = build.passiveTree.allocatedNodes.size * 0.04;

  return baseEvasion * (1 + treeInc);
}

function estimateBlockChance(build: Build): number {
  // Check for shield
  const hasShield = Array.from(build.items.slots.entries()).some(
    ([slot, item]) => slot.includes('Weapon 2') && item?.itemClass.includes('Shield')
  );

  if (!hasShield) return 0;

  // Base shield block + tree
  const baseBlock = 25; // Typical shield
  const treeBlock = build.passiveTree.allocatedNodes.size * 0.1;

  return Math.min(baseBlock + treeBlock, 75); // Cap at 75%
}

function estimateLifeRegen(build: Build): number {
  const life = estimateLife(build);

  // Base regen is very low
  const baseRegen = 0;

  // Tree provides most regen
  const treeRegenPercent = build.passiveTree.allocatedNodes.size * 0.02; // 0.02% per node

  return baseRegen + life * (treeRegenPercent / 100);
}

function calculateEffectiveHP(build: Build, layers: DefenseLayer[]): number {
  const lifeLayer = layers.find((l) => l.name === 'Life Pool');
  const esLayer = layers.find((l) => l.name === 'Energy Shield');
  const elementalRes = layers.find((l) => l.name === 'Elemental Resistances');

  const rawHP = (lifeLayer?.currentValue || 0) + (esLayer?.currentValue || 0);

  // Resistances multiply EHP
  const resMult = elementalRes ? 1 / (1 - elementalRes.currentValue / 100) : 1;

  return rawHP * resMult;
}

function calculateSurvivalRating(
  effectiveHP: number,
  vulnerabilities: Vulnerability[]
): 'Critical' | 'Weak' | 'Moderate' | 'Strong' | 'Excellent' {
  const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical').length;
  const highVulns = vulnerabilities.filter((v) => v.severity === 'high').length;

  if (criticalVulns > 0) return 'Critical';
  if (highVulns > 2 || effectiveHP < 2000) return 'Weak';
  if (highVulns > 0 || effectiveHP < 5000) return 'Moderate';
  if (effectiveHP < 10000) return 'Strong';
  return 'Excellent';
}

function generateDefenseExplanation(
  build: Build,
  rating: string,
  vulnerabilities: Vulnerability[]
): string {
  let explanation = `Your build's survival rating is ${rating}. `;

  if (vulnerabilities.length === 0) {
    explanation += 'Your defenses are well-rounded with no critical vulnerabilities!';
  } else if (vulnerabilities[0].severity === 'critical') {
    explanation += `CRITICAL: ${vulnerabilities[0].description}. ${vulnerabilities[0].impact} Fix this immediately!`;
  } else {
    explanation += `Your main vulnerability is ${vulnerabilities[0].type} damage. ${vulnerabilities[0].impact}`;
  }

  return explanation;
}

// Status helpers

function getLifeStatus(life: number, level: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  const benchmark = level * 12;
  if (life < benchmark * 0.5) return 'critical';
  if (life < benchmark * 0.75) return 'warning';
  if (life < benchmark) return 'ok';
  if (life < benchmark * 1.5) return 'good';
  return 'excellent';
}

function getESStatus(es: number, level: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  const benchmark = level * 15;
  if (es < benchmark * 0.3) return 'warning';
  if (es < benchmark * 0.75) return 'ok';
  if (es < benchmark) return 'good';
  return 'excellent';
}

function getResistanceStatus(res: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  if (res < 0) return 'critical';
  if (res < 50) return 'warning';
  if (res < 75) return 'ok';
  return 'excellent';
}

function getChaosResStatus(res: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  if (res < -40) return 'warning';
  if (res < 0) return 'ok';
  if (res < 50) return 'good';
  return 'excellent';
}

function getArmourStatus(armour: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  if (armour < 5000) return 'warning';
  if (armour < 15000) return 'ok';
  if (armour < 30000) return 'good';
  return 'excellent';
}

function getEvasionStatus(evasion: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  if (evasion < 5000) return 'warning';
  if (evasion < 15000) return 'ok';
  if (evasion < 30000) return 'good';
  return 'excellent';
}

function getBlockStatus(block: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  if (block < 20) return 'warning';
  if (block < 50) return 'ok';
  if (block < 75) return 'good';
  return 'excellent';
}

function getRegenStatus(regen: number, maxLife: number): 'critical' | 'warning' | 'ok' | 'good' | 'excellent' {
  const regenPercent = (regen / maxLife) * 100;
  if (regenPercent < 1) return 'warning';
  if (regenPercent < 3) return 'ok';
  if (regenPercent < 5) return 'good';
  return 'excellent';
}

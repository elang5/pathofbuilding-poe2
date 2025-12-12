/**
 * PoB XML Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { parsePobXml, parsePassiveTree, parseConfig } from '@/lib/pob/parser';

describe('parsePobXml', () => {
  describe('Valid XML', () => {
    it('parses minimal valid PoB XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PathOfBuilding>
  <Build level="90" className="Witch" ascendClassName="Necromancer" targetVersion="3_0" characterName="TestBuild"/>
  <Tree activeSpec="1">
    <Spec id="1" nodes="12345,67890" treeVersion="3_21"/>
  </Tree>
  <Skills activeSkillSet="1"/>
  <Items activeItemSet="1"/>
</PathOfBuilding>`;

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.name).toBe('TestBuild');
        expect(result.build.level).toBe(90);
        expect(result.build.className).toBe('Witch');
        expect(result.build.ascendancy).toBe('Necromancer');
        expect(result.build.version).toBe('3_0');
      }
    });

    it('parses build without ascendancy', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PathOfBuilding>
  <Build level="50" className="Ranger"/>
</PathOfBuilding>`;

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.className).toBe('Ranger');
        expect(result.build.ascendancy).toBeNull();
        expect(result.build.level).toBe(50);
      }
    });

    it('generates a unique build ID', () => {
      const xml = `<?xml version="1.0"?>
<PathOfBuilding>
  <Build level="1" className="Warrior"/>
</PathOfBuilding>`;

      const result1 = parsePobXml(xml);
      const result2 = parsePobXml(xml);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        expect(result1.build.id).not.toBe(result2.build.id);
        expect(result1.build.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      }
    });

    it('sets importedAt timestamp', () => {
      const xml = `<?xml version="1.0"?>
<PathOfBuilding>
  <Build level="1" className="Monk"/>
</PathOfBuilding>`;

      const before = new Date();
      const result = parsePobXml(xml);
      const after = new Date();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.source.importedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.build.source.importedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      }
    });

    it('handles default values for missing attributes', () => {
      const xml = `<?xml version="1.0"?>
<PathOfBuilding>
  <Build/>
</PathOfBuilding>`;

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.level).toBe(1);
        expect(result.build.className).toBe('Witch');
        expect(result.build.name).toBe('Unnamed Build');
      }
    });
  });

  describe('Invalid XML', () => {
    it('rejects malformed XML', () => {
      const xml = '<PathOfBuilding><Build level="90"</Build></PathOfBuilding>'; // Missing >

      const result = parsePobXml(xml);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('MALFORMED_XML');
      }
    });

    it('rejects XML without PathOfBuilding root', () => {
      const xml = '<?xml version="1.0"?><SomeOtherRoot><Build/></SomeOtherRoot>';

      const result = parsePobXml(xml);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('MALFORMED_XML');
        if (result.error.type === 'MALFORMED_XML') {
          expect(result.error.message).toContain('PathOfBuilding');
        }
      }
    });

    it('allows XML without Build element (uses defaults)', () => {
      const xml = '<?xml version="1.0"?><PathOfBuilding><Tree/></PathOfBuilding>';

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should use default values
        expect(result.build.level).toBe(1);
        expect(result.build.className).toBe('Witch');
      }
    });

    it('handles unclosed tags gracefully', () => {
      const xml = '<PathOfBuilding><Build level="90">';

      const result = parsePobXml(xml);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('MALFORMED_XML');
      }
    });
  });

  describe('Complex Structures', () => {
    it('parses build with config section', () => {
      const xml = `<?xml version="1.0"?>
<PathOfBuilding>
  <Build level="90" className="Witch"/>
  <Config>
    <Input name="enemyLevel" number="83"/>
    <Input name="usePowerCharges" boolean="true"/>
    <Input name="enemyIsBoss" boolean="true"/>
  </Config>
</PathOfBuilding>`;

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.config.enemyLevel).toBe(83);
        expect(result.build.config.usePowerCharges).toBe(true);
        expect(result.build.config.enemyIsBoss).toBe(true);
      }
    });

    it('parses build with passive tree', () => {
      const xml = `<?xml version="1.0"?>
<PathOfBuilding>
  <Build level="90" className="Witch"/>
  <Tree activeSpec="1">
    <Spec id="1" nodes="12345,67890,11111" treeVersion="3_21"/>
  </Tree>
</PathOfBuilding>`;

      const result = parsePobXml(xml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.build.passiveTree.allocatedNodes.size).toBe(3);
        expect(result.build.passiveTree.allocatedNodes.has(12345)).toBe(true);
        expect(result.build.passiveTree.allocatedNodes.has(67890)).toBe(true);
        expect(result.build.passiveTree.allocatedNodes.has(11111)).toBe(true);
        expect(result.build.passiveTree.version).toBe('3_21');
      }
    });
  });
});

describe('parsePassiveTree', () => {
  it('parses tree with allocated nodes', () => {
    const treeData = {
      '@_activeSpec': 1,
      Spec: {
        '@_id': 1,
        '@_nodes': '12345,67890,11111',
        '@_treeVersion': '3_21',
      },
    };

    const tree = parsePassiveTree(treeData);

    expect(tree.allocatedNodes.size).toBe(3);
    expect(tree.allocatedNodes.has(12345)).toBe(true);
    expect(tree.allocatedNodes.has(67890)).toBe(true);
    expect(tree.version).toBe('3_21');
    expect(tree.totalPoints).toBe(3);
  });

  it('parses tree with jewel sockets', () => {
    const treeData = {
      '@_activeSpec': 1,
      Spec: {
        '@_id': 1,
        '@_nodes': '12345',
        Sockets: {
          Socket: [
            { '@_nodeId': 26725, '@_itemId': 1 },
            { '@_nodeId': 36634, '@_itemId': 2 },
          ],
        },
      },
    };

    const tree = parsePassiveTree(treeData);

    expect(tree.jewelSockets.length).toBe(2);
    expect(tree.jewelSockets[0]?.nodeId).toBe(26725);
    expect(tree.jewelSockets[0]?.itemId).toBe(1);
    expect(tree.jewelSockets[1]?.nodeId).toBe(36634);
    expect(tree.jewelSockets[1]?.itemId).toBe(2);
  });

  it('handles single socket (non-array)', () => {
    const treeData = {
      '@_activeSpec': 1,
      Spec: {
        '@_id': 1,
        '@_nodes': '12345',
        Sockets: {
          Socket: { '@_nodeId': 26725, '@_itemId': 1 },
        },
      },
    };

    const tree = parsePassiveTree(treeData);

    expect(tree.jewelSockets.length).toBe(1);
    expect(tree.jewelSockets[0]?.nodeId).toBe(26725);
  });

  it('returns empty tree when no data provided', () => {
    const tree = parsePassiveTree(null);

    expect(tree.allocatedNodes.size).toBe(0);
    expect(tree.jewelSockets.length).toBe(0);
    expect(tree.totalPoints).toBe(0);
  });

  it('handles malformed node IDs gracefully', () => {
    const treeData = {
      '@_activeSpec': 1,
      Spec: {
        '@_id': 1,
        '@_nodes': '12345,invalid,67890,',
      },
    };

    const tree = parsePassiveTree(treeData);

    expect(tree.allocatedNodes.size).toBe(2);
    expect(tree.allocatedNodes.has(12345)).toBe(true);
    expect(tree.allocatedNodes.has(67890)).toBe(true);
  });

  it('handles multiple specs and selects active one', () => {
    const treeData = {
      '@_activeSpec': 2,
      Spec: [
        { '@_id': 1, '@_nodes': '11111' },
        { '@_id': 2, '@_nodes': '22222,33333' },
      ],
    };

    const tree = parsePassiveTree(treeData);

    expect(tree.allocatedNodes.size).toBe(2);
    expect(tree.allocatedNodes.has(22222)).toBe(true);
    expect(tree.allocatedNodes.has(33333)).toBe(true);
  });
});

describe('parseConfig', () => {
  it('parses boolean config values', () => {
    const configData = {
      Input: [
        { '@_name': 'usePowerCharges', '@_boolean': true },
        { '@_name': 'useFrenzyCharges', '@_boolean': 'true' },
        { '@_name': 'enemyIsBoss', '@_boolean': false },
      ],
    };

    const config = parseConfig(configData);

    expect(config.usePowerCharges).toBe(true);
    expect(config.useFrenzyCharges).toBe(true);
    expect(config.enemyIsBoss).toBe(false);
  });

  it('parses number config values', () => {
    const configData = {
      Input: [
        { '@_name': 'enemyLevel', '@_number': 83 },
        { '@_name': 'resistancePenalty', '@_number': -60 },
      ],
    };

    const config = parseConfig(configData);

    expect(config.enemyLevel).toBe(83);
    expect(config.resistancePenalty).toBe(-60);
  });

  it('parses string config values', () => {
    const configData = {
      Input: [{ '@_name': 'customSetting', '@_string': 'some value' }],
    };

    const config = parseConfig(configData);

    expect(config.customConfig?.['customSetting']).toBe('some value');
  });

  it('handles single input (non-array)', () => {
    const configData = {
      Input: { '@_name': 'enemyLevel', '@_number': 83 },
    };

    const config = parseConfig(configData);

    expect(config.enemyLevel).toBe(83);
  });

  it('returns empty config when no data provided', () => {
    const config = parseConfig(null);

    expect(config).toEqual({ customConfig: {} });
  });

  it('stores unknown config keys in customConfig', () => {
    const configData = {
      Input: [
        { '@_name': 'unknownSetting1', '@_boolean': true },
        { '@_name': 'unknownSetting2', '@_number': 42 },
      ],
    };

    const config = parseConfig(configData);

    expect(config.customConfig?.['unknownSetting1']).toBe(true);
    expect(config.customConfig?.['unknownSetting2']).toBe(42);
  });

  it('ignores inputs without name', () => {
    const configData = {
      Input: [{ '@_boolean': true }, { '@_name': 'enemyLevel', '@_number': 83 }],
    };

    const config = parseConfig(configData);

    expect(config.enemyLevel).toBe(83);
    expect(Object.keys(config.customConfig || {}).length).toBe(0);
  });
});

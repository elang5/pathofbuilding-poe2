/**
 * End-to-End Import Flow Tests
 *
 * Tests the complete flow: PoB code → XML → Domain models
 */

import { describe, it, expect } from 'vitest';
import { decodePobCode, encodeToPobCode } from '@/lib/pob/decoder';
import { parsePobXml } from '@/lib/pob/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Complete Import Flow', () => {
  it('imports a complete build from PoB code to domain model', () => {
    // Load the fixture
    const fixturePath = join(__dirname, '../fixtures/sample-builds/minimal-build.json');
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

    // Step 1: Decode PoB code to XML
    const decodeResult = decodePobCode(fixture.code);

    expect(decodeResult.success).toBe(true);
    if (!decodeResult.success) return;

    // Verify XML is valid
    expect(decodeResult.xml).toContain('<PathOfBuilding');
    expect(decodeResult.xml).toContain('</PathOfBuilding>');

    // Step 2: Parse XML to domain model
    const parseResult = parsePobXml(decodeResult.xml);

    expect(parseResult.success).toBe(true);
    if (!parseResult.success) return;

    const build = parseResult.build;

    // Step 3: Verify build metadata
    expect(build.level).toBe(fixture.expectedData.level);
    expect(build.className).toBe(fixture.expectedData.className);
    expect(build.ascendancy).toBe(fixture.expectedData.ascendancy);
    expect(build.name).toBe(fixture.expectedData.characterName);

    // Step 4: Verify passive tree
    expect(build.passiveTree.allocatedNodes.size).toBe(fixture.expectedData.allocatedNodes);
    expect(build.passiveTree.jewelSockets.length).toBe(fixture.expectedData.jewelSockets);
    expect(build.passiveTree.version).toBe('3_21');

    // Verify specific nodes are allocated
    expect(build.passiveTree.allocatedNodes.has(12345)).toBe(true);
    expect(build.passiveTree.allocatedNodes.has(26725)).toBe(true);

    // Step 5: Verify jewel sockets
    const socket1 = build.passiveTree.jewelSockets.find((s) => s.nodeId === 26725);
    expect(socket1).toBeDefined();
    expect(socket1?.itemId).toBe(1);

    const socket2 = build.passiveTree.jewelSockets.find((s) => s.nodeId === 36634);
    expect(socket2).toBeDefined();
    expect(socket2?.itemId).toBe(2);

    // Step 6: Verify config
    expect(build.config.enemyLevel).toBe(83);
    expect(build.config.enemyIsBoss).toBe(true);
    expect(build.config.usePowerCharges).toBe(true);
    expect(build.config.useFrenzyCharges).toBe(false);

    // Step 7: Verify items (structure exists even if empty for Phase 1)
    expect(build.items).toBeDefined();
    expect(build.items.activeSet).toBe(1);

    // Step 8: Verify skills (structure exists even if empty for Phase 1)
    expect(build.skills).toBeDefined();
    expect(build.skills.activeSet).toBe(1);

    // Step 9: Verify source metadata
    expect(build.id).toBeTruthy();
    expect(build.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(build.source.importedAt).toBeInstanceOf(Date);
  });

  it('handles round-trip encoding/decoding', () => {
    const originalXml = `<?xml version="1.0" encoding="UTF-8"?>
<PathOfBuilding>
  <Build level="75" className="Ranger" characterName="RoundTripTest"/>
  <Tree activeSpec="1">
    <Spec id="1" nodes="11111,22222,33333" treeVersion="3_21"/>
  </Tree>
  <Config>
    <Input name="enemyLevel" number="80"/>
  </Config>
</PathOfBuilding>`;

    // Encode to PoB code
    const pobCode = encodeToPobCode(originalXml);

    // Decode back to XML
    const decodeResult = decodePobCode(pobCode);
    expect(decodeResult.success).toBe(true);

    if (!decodeResult.success) return;

    // Parse to build
    const parseResult = parsePobXml(decodeResult.xml);
    expect(parseResult.success).toBe(true);

    if (!parseResult.success) return;

    const build = parseResult.build;
    expect(build.level).toBe(75);
    expect(build.className).toBe('Ranger');
    expect(build.name).toBe('RoundTripTest');
    expect(build.passiveTree.allocatedNodes.size).toBe(3);
    expect(build.config.enemyLevel).toBe(80);
  });

  it('preserves all data through the pipeline', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PathOfBuilding>
  <Build
    level="100"
    className="Sorceress"
    ascendClassName="Chronomancer"
    characterName="DataPreservationTest"
    targetVersion="3_0"/>
  <Tree activeSpec="1">
    <Spec id="1" nodes="1,2,3,4,5" treeVersion="3_21">
      <Sockets>
        <Socket nodeId="1" itemId="100"/>
      </Sockets>
    </Spec>
  </Tree>
  <Config>
    <Input name="enemyLevel" number="90"/>
    <Input name="usePowerCharges" boolean="true"/>
    <Input name="resistancePenalty" number="-60"/>
    <Input name="customValue" string="test"/>
  </Config>
</PathOfBuilding>`;

    const pobCode = encodeToPobCode(xml);
    const decodeResult = decodePobCode(pobCode);

    expect(decodeResult.success).toBe(true);
    if (!decodeResult.success) return;

    const parseResult = parsePobXml(decodeResult.xml);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) return;

    const build = parseResult.build;

    // Verify all metadata preserved
    expect(build.level).toBe(100);
    expect(build.className).toBe('Sorceress');
    expect(build.ascendancy).toBe('Chronomancer');
    expect(build.name).toBe('DataPreservationTest');
    expect(build.version).toBe('3_0');

    // Verify tree preserved
    expect(build.passiveTree.allocatedNodes.size).toBe(5);
    expect(build.passiveTree.allocatedNodes.has(1)).toBe(true);
    expect(build.passiveTree.allocatedNodes.has(5)).toBe(true);
    expect(build.passiveTree.jewelSockets[0]?.nodeId).toBe(1);
    expect(build.passiveTree.jewelSockets[0]?.itemId).toBe(100);

    // Verify config preserved
    expect(build.config.enemyLevel).toBe(90);
    expect(build.config.usePowerCharges).toBe(true);
    expect(build.config.resistancePenalty).toBe(-60);
    expect(build.config.customConfig?.['customValue']).toBe('test');
  });

  it('handles malformed PoB codes gracefully', () => {
    const invalidCode = 'definitely-not-a-valid-pob-code';

    const decodeResult = decodePobCode(invalidCode);

    expect(decodeResult.success).toBe(false);
    if (!decodeResult.success) {
      // Can be either INVALID_BASE64 or DECOMPRESSION_FAILED depending on the invalid code
      expect(['INVALID_BASE64', 'DECOMPRESSION_FAILED']).toContain(decodeResult.error.type);
      expect(decodeResult.error.message).toBeTruthy();
    }
  });

  it('handles corrupted XML gracefully', () => {
    const corruptedXml = '<PathOfBuilding><Build level="broken';

    const parseResult = parsePobXml(corruptedXml);

    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      expect(parseResult.error.type).toBe('MALFORMED_XML');
    }
  });
});

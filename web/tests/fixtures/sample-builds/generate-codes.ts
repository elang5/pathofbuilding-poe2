/**
 * Generate PoB codes from XML fixtures
 * Run with: npx tsx tests/fixtures/sample-builds/generate-codes.ts
 */

/* eslint-disable no-console */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { encodeToPobCode } from '../../../lib/pob/decoder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const xmlFile = join(__dirname, 'minimal-build.xml');
const xml = readFileSync(xmlFile, 'utf-8');
const pobCode = encodeToPobCode(xml);

const output = {
  name: 'Minimal Minion Build',
  description: 'A simple test build for PoE2 Build Coach',
  code: pobCode,
  expectedData: {
    level: 90,
    className: 'Witch',
    ascendancy: 'Necromancer',
    characterName: 'TestMinion',
    allocatedNodes: 9,
    jewelSockets: 2,
  },
};

writeFileSync(join(__dirname, 'minimal-build.json'), JSON.stringify(output, null, 2));

console.log('Generated PoB code:');
console.log(pobCode);
console.log('\nSaved to minimal-build.json');

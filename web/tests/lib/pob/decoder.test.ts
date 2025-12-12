/**
 * PoB Decoder Tests
 *
 * Tests for Base64 decoding, decompression, and security validation
 */

import { describe, it, expect } from 'vitest';
import { decodePobCode, encodeToPobCode } from '@/lib/pob/decoder';
import pako from 'pako';

describe('decodePobCode', () => {
  // Helper to create a valid PoB code from XML
  const createValidPobCode = (xml: string): string => {
    const compressed = pako.deflate(xml);
    const binaryString = Array.from(compressed, (byte) => String.fromCharCode(byte)).join('');
    const base64 = btoa(binaryString);
    return base64.replace(/\+/g, '-').replace(/\//g, '_');
  };

  describe('Valid Inputs', () => {
    it('decodes a valid minimal PoB code to XML', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><PathOfBuilding></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.xml).toContain('<PathOfBuilding');
        expect(result.xml).toContain('</PathOfBuilding>');
      }
    });

    it('decodes PoB code without XML declaration', () => {
      const xml = '<PathOfBuilding><Build level="90"/></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.xml).toContain('<PathOfBuilding');
        expect(result.xml).toContain('level="90"');
      }
    });

    it('handles PoB codes with standard Base64 characters', () => {
      const xml = '<?xml version="1.0"?><PathOfBuilding><Build/></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
    });

    it('trims whitespace from input', () => {
      const xml = '<?xml version="1.0"?><PathOfBuilding></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);
      const codeWithWhitespace = `  \n${pobCode}\n  `;

      const result = decodePobCode(codeWithWhitespace);

      expect(result.success).toBe(true);
    });

    it('decodes complex XML with nested elements', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PathOfBuilding>
  <Build level="90" className="Witch">
    <PlayerStat stat="Life" value="4500"/>
  </Build>
  <Tree activeSpec="1">
    <Spec nodes="12345,67890"/>
  </Tree>
</PathOfBuilding>`;
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.xml).toContain('className="Witch"');
        expect(result.xml).toContain('PlayerStat');
      }
    });
  });

  describe('Invalid Base64', () => {
    it('rejects completely invalid Base64', () => {
      const result = decodePobCode('not-valid-base64!!!@#$%');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_BASE64');
      }
    });

    it('rejects empty string', () => {
      const result = decodePobCode('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_INPUT');
      }
    });

    it('rejects Base64 with invalid characters', () => {
      const result = decodePobCode('SGVs bG8gV29ybGQ='); // space in the middle

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_BASE64');
      }
    });
  });

  describe('Decompression Errors', () => {
    it('handles corrupted compressed data gracefully', () => {
      // Valid Base64 but invalid zlib data
      const invalidCompressed = 'SGVsbG8gV29ybGQ='; // "Hello World" in Base64, not compressed

      const result = decodePobCode(invalidCompressed);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('DECOMPRESSION_FAILED');
        expect(result.error.message).toContain('corrupted');
      }
    });

    it('handles truncated compressed data', () => {
      const xml = '<?xml version="1.0"?><PathOfBuilding></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);
      const truncated = pobCode.slice(0, -10); // Remove last 10 characters

      const result = decodePobCode(truncated);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(['DECOMPRESSION_FAILED', 'INVALID_BASE64']).toContain(result.error.type);
      }
    });
  });

  describe('XML Validation', () => {
    it('rejects non-XML data', () => {
      const notXml = 'This is just plain text, not XML';
      const pobCode = createValidPobCode(notXml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_XML');
      }
    });

    it('rejects XML without PathOfBuilding tag', () => {
      const xml = '<?xml version="1.0"?><SomeOtherRoot></SomeOtherRoot>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_XML');
      }
    });

    it('rejects XML with script tags (security)', () => {
      const maliciousXml = '<PathOfBuilding><script>alert("xss")</script></PathOfBuilding>';
      const pobCode = createValidPobCode(maliciousXml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_XML');
        expect(result.error.message).toContain('malicious');
      }
    });

    it('rejects XML with javascript: protocol (security)', () => {
      const maliciousXml =
        '<PathOfBuilding><a href="javascript:alert(1)">click</a></PathOfBuilding>';
      const pobCode = createValidPobCode(maliciousXml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_XML');
      }
    });
  });

  describe('Security & Size Limits', () => {
    it('rejects input exceeding maximum size', () => {
      // Create a very large input (> 5MB)
      const largeInput = 'A'.repeat(6 * 1024 * 1024);

      const result = decodePobCode(largeInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INPUT_TOO_LARGE');
      }
    });

    it('rejects decompressed data exceeding maximum size', () => {
      // Create XML that would decompress to > 50MB
      const largeXml = `<PathOfBuilding>${'<node/>'.repeat(10_000_000)}</PathOfBuilding>`;
      const pobCode = createValidPobCode(largeXml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('OUTPUT_TOO_LARGE');
      }
    });

    it('handles non-string input gracefully', () => {
      // @ts-expect-error Testing invalid input
      const result = decodePobCode(null);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_INPUT');
      }
    });

    it('handles undefined input gracefully', () => {
      // @ts-expect-error Testing invalid input
      const result = decodePobCode(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_INPUT');
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles XML with special characters', () => {
      const xml =
        '<?xml version="1.0"?><PathOfBuilding><Item>Rare &amp; Unique &lt;item&gt;</Item></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.xml).toContain('&amp;');
        expect(result.xml).toContain('&lt;');
      }
    });

    it('handles XML with CDATA sections', () => {
      const xml =
        '<?xml version="1.0"?><PathOfBuilding><Notes><![CDATA[Build notes with <special> characters]]></Notes></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.xml).toContain('CDATA');
      }
    });

    it('handles XML with UTF-8 characters', () => {
      const xml =
        '<?xml version="1.0" encoding="UTF-8"?><PathOfBuilding><Notes>你好世界 مرحبا בהצלחה</Notes></PathOfBuilding>';
      const pobCode = createValidPobCode(xml);

      const result = decodePobCode(pobCode);

      expect(result.success).toBe(true);
    });
  });
});

describe('encodeToPobCode', () => {
  it('encodes XML to a valid PoB code', () => {
    const xml = '<?xml version="1.0"?><PathOfBuilding></PathOfBuilding>';

    const pobCode = encodeToPobCode(xml);

    expect(pobCode).toBeTruthy();
    expect(typeof pobCode).toBe('string');
    expect(pobCode.length).toBeGreaterThan(0);
  });

  it('creates a code that can be decoded back to the original XML', () => {
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?><PathOfBuilding><Build level="90"/></PathOfBuilding>';

    const pobCode = encodeToPobCode(xml);
    const result = decodePobCode(pobCode);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.xml).toBe(xml);
    }
  });

  it('uses PoB-specific character replacements', () => {
    const xml = '<?xml version="1.0"?><PathOfBuilding></PathOfBuilding>';

    const pobCode = encodeToPobCode(xml);

    // Should contain '-' and '_' instead of '+' and '/'
    expect(pobCode).not.toContain('+');
    expect(pobCode).not.toContain('/');
  });

  it('throws error for invalid input', () => {
    // @ts-expect-error Testing invalid input
    expect(() => encodeToPobCode(null)).toThrow();
    // @ts-expect-error Testing invalid input
    expect(() => encodeToPobCode(undefined)).toThrow();
    expect(() => encodeToPobCode('')).toThrow();
  });

  it('handles large XML documents', () => {
    const largeXml = `<PathOfBuilding>${'<node id="1"/>'.repeat(1000)}</PathOfBuilding>`;

    const pobCode = encodeToPobCode(largeXml);
    const result = decodePobCode(pobCode);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.xml).toBe(largeXml);
    }
  });
});

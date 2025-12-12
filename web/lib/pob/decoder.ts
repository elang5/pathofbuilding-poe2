/**
 * PoB Code Decoder
 *
 * Decodes Path of Building export codes into raw XML.
 * Security: Validates input, limits decompression size, sanitizes output.
 */

import pako from 'pako';

// Security constants
const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5MB max input
const MAX_DECOMPRESSED_SIZE = 50 * 1024 * 1024; // 50MB max decompressed (prevent zip bombs)
const BASE64_PATTERN = /^[A-Za-z0-9+/\-_]+=*$/;

export type DecodeError =
  | { type: 'INVALID_INPUT'; message: string }
  | { type: 'INPUT_TOO_LARGE'; message: string }
  | { type: 'INVALID_BASE64'; message: string }
  | { type: 'DECOMPRESSION_FAILED'; message: string }
  | { type: 'OUTPUT_TOO_LARGE'; message: string }
  | { type: 'INVALID_XML'; message: string }
  | { type: 'UNKNOWN'; message: string };

export type DecodeResult =
  | {
      success: true;
      xml: string;
    }
  | {
      success: false;
      error: DecodeError;
    };

/**
 * Decodes a PoB export code into raw XML
 *
 * @param pobCode - The Base64-encoded, compressed build code
 * @returns DecodeResult with XML string or error
 *
 * @example
 * const result = decodePobCode("eNrtV1tP2zAU...");
 * if (result.success) {
 *   console.log(result.xml);
 * }
 */
export function decodePobCode(pobCode: string): DecodeResult {
  try {
    // Step 1: Input validation
    if (!pobCode || typeof pobCode !== 'string') {
      return {
        success: false,
        error: {
          type: 'INVALID_INPUT',
          message: 'Input must be a non-empty string',
        },
      };
    }

    // Trim whitespace
    const trimmedCode = pobCode.trim();

    // Check size limit
    if (trimmedCode.length > MAX_INPUT_SIZE) {
      return {
        success: false,
        error: {
          type: 'INPUT_TOO_LARGE',
          message: `Input size exceeds maximum of ${MAX_INPUT_SIZE} bytes`,
        },
      };
    }

    // Step 2: Reverse Base64 character replacements (PoB-specific encoding)
    const standardBase64 = trimmedCode.replace(/-/g, '+').replace(/_/g, '/');

    // Validate Base64 format
    if (!BASE64_PATTERN.test(standardBase64)) {
      return {
        success: false,
        error: {
          type: 'INVALID_BASE64',
          message: "This doesn't look like a valid PoB code. Make sure you copied the entire code.",
        },
      };
    }

    // Step 3: Decode Base64 to binary
    let bytes: Uint8Array;
    try {
      // Use native atob for Base64 decoding (available in both browser and Node.js 16+)
      const binaryString = atob(standardBase64);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch {
      return {
        success: false,
        error: {
          type: 'INVALID_BASE64',
          message: 'Failed to decode Base64. The code may be corrupted.',
        },
      };
    }

    // Step 4: Decompress with zlib (inflate)
    let decompressed: string;
    try {
      // Use pako for decompression
      const inflated = pako.inflate(bytes, {
        to: 'string',
      });

      // Check decompressed size
      if (inflated.length > MAX_DECOMPRESSED_SIZE) {
        return {
          success: false,
          error: {
            type: 'OUTPUT_TOO_LARGE',
            message:
              'Decompressed data exceeds safety limit. This may be a malformed or malicious file.',
          },
        };
      }

      decompressed = inflated;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      return {
        success: false,
        error: {
          type: 'DECOMPRESSION_FAILED',
          message: `The build code appears to be corrupted. Try generating a new one from PoB. (${errorMessage})`,
        },
      };
    }

    // Step 5: Validate XML structure
    const trimmedXml = decompressed.trim();

    // Check for XML declaration or PathOfBuilding root element
    const isValidXmlStart =
      trimmedXml.startsWith('<?xml') ||
      trimmedXml.startsWith('<PathOfBuilding2') ||
      trimmedXml.startsWith('<PathOfBuilding');

    const hasPathOfBuildingTag =
      trimmedXml.includes('<PathOfBuilding2') || trimmedXml.includes('<PathOfBuilding>');

    if (!isValidXmlStart || !hasPathOfBuildingTag) {
      return {
        success: false,
        error: {
          type: 'INVALID_XML',
          message: 'Decoded data is not valid PoB XML. This may be from an incompatible version.',
        },
      };
    }

    // Additional XML safety checks
    if (trimmedXml.includes('<script') || trimmedXml.includes('javascript:')) {
      return {
        success: false,
        error: {
          type: 'INVALID_XML',
          message: 'XML contains potentially malicious content',
        },
      };
    }

    return {
      success: true,
      xml: trimmedXml,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return {
      success: false,
      error: {
        type: 'UNKNOWN',
        message: `Unexpected error while decoding: ${errorMessage}`,
      },
    };
  }
}

/**
 * Encodes build XML back to a PoB-compatible code
 * (Future feature for round-trip support)
 *
 * @param xml - The XML string to encode
 * @returns Base64-encoded PoB code
 */
export function encodeToPobCode(xml: string): string {
  // Validate input
  if (!xml || typeof xml !== 'string') {
    throw new Error('Invalid XML input');
  }

  // Step 1: Compress with zlib (deflate)
  const compressed = pako.deflate(xml);

  // Step 2: Encode to Base64
  const binaryString = Array.from(compressed, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binaryString);

  // Step 3: Apply PoB-specific character replacements
  const pobCode = base64.replace(/\+/g, '-').replace(/\//g, '_');

  return pobCode;
}

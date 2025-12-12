/**
 * PoB Code Input Component
 */

'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { decodePobCode, parsePobXml } from '@/lib/pob';
import type { Build } from '@/lib/domain';

interface PobCodeInputProps {
  onBuildImported: (build: Build) => void;
}

export function PobCodeInput({ onBuildImported }: PobCodeInputProps) {
  const [pobCode, setPobCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    setIsProcessing(true);

    try {
      // Step 1: Decode PoB code
      const decodeResult = decodePobCode(pobCode.trim());

      if (!decodeResult.success) {
        setError(decodeResult.error.message);
        setIsProcessing(false);
        return;
      }

      // Step 2: Parse XML
      const parseResult = parsePobXml(decodeResult.xml);

      if (!parseResult.success) {
        const errorMsg =
          parseResult.error.type === 'MALFORMED_XML'
            ? parseResult.error.message
            : parseResult.error.type === 'UNSUPPORTED_VERSION'
              ? `Unsupported version: ${parseResult.error.version}`
              : parseResult.error.type === 'MISSING_REQUIRED_FIELD'
                ? `Missing required field: ${parseResult.error.field}`
                : 'Failed to parse build XML';
        setError(errorMsg);
        setIsProcessing(false);
        return;
      }

      // Step 3: Store the original PoB code in the build
      parseResult.build.source.pobCode = pobCode.trim();

      // Success!
      onBuildImported(parseResult.build);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPobCode(text);
      setError(null);
    } catch {
      setError('Failed to read from clipboard. Please paste manually.');
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="Path of Building Code"
        value={pobCode}
        onChange={(e) => {
          setPobCode(e.target.value);
          setError(null);
        }}
        placeholder="Paste your PoB code here... (starts with eN...)"
        rows={8}
        {...(error ? { error } : {})}
        helperText="Export your build from Path of Building 2 and paste the code here"
        className="font-mono text-sm"
      />

      {error && (
        <Alert variant="error" title="Import Error">
          {error}
        </Alert>
      )}

      <div className="flex gap-3">
        <Button onClick={handleImport} isLoading={isProcessing} disabled={!pobCode.trim()}>
          Import Build
        </Button>
        <Button variant="secondary" onClick={handlePaste}>
          Paste from Clipboard
        </Button>
      </div>

      <Alert variant="info">
        <strong>How to get your PoB code:</strong>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Open Path of Building 2</li>
          <li>Click &quot;Import/Export Build&quot; at the top</li>
          <li>Click &quot;Generate&quot; to create a share code</li>
          <li>Copy the code and paste it above</li>
        </ol>
      </Alert>
    </div>
  );
}

/**
 * Textarea Component
 */

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`block w-full rounded-lg border ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        } bg-white p-3 text-gray-900 shadow-sm focus:ring-2 focus:outline-none ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

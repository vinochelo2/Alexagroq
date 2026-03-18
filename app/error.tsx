'use client';

import React from 'react';
import { useEffect } from 'react';
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Algo salió mal</h1>
        <p className="text-slate-600">Hubo un error al cargar esta página.</p>
        <button
          onClick={() => reset()}
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

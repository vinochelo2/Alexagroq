'use client';

import React from "react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-4xl font-bold text-slate-900">Error Crítico</h1>
            <p className="text-slate-600">
              Lo sentimos, ha ocurrido un error inesperado en el sistema.
            </p>
            <button
              onClick={() => reset()}
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

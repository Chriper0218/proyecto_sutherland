'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

interface TableauVizElement extends HTMLElement {
  refreshDataAsync?: () => Promise<void>;
}

const TABLEAU_VIZ_URL =
  process.env.NEXT_PUBLIC_TABLEAU_VIZ_URL ||
  'https://10ax.online.tableau.com/t/riskoperations/views/Risk_metrics_dashboard/Dashboard';

export default function AnalyticsPage() {
  const [jwtToken, setJwtToken] = useState<string>('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [refreshingViz, setRefreshingViz] = useState<boolean>(false);
  const vizRef = useRef<TableauVizElement | null>(null);

  const fetchTableauToken = useCallback(async () => {
    try {
      const res = await fetch('/api/tableau-token', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setTokenError(data.error || 'No se pudo obtener el token de Tableau');
        return;
      }
      setJwtToken(data.token);
      setTokenError(null);
    } catch (err) {
      console.error('Error al obtener token JWT de Tableau:', err);
      setTokenError('Error de conexión al autenticar con Tableau Cloud.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadToken = async () => {
      try {
        const res = await fetch('/api/tableau-token', { cache: 'no-store' });
        const data = await res.json();
        if (ignore) return;
        if (!res.ok || !data.token) {
          setTokenError(data.error || 'No se pudo obtener el token de Tableau');
          return;
        }
        setJwtToken(data.token);
        setTokenError(null);
      } catch (err) {
        console.error('Error al obtener token JWT de Tableau:', err);
        if (!ignore) {
          setTokenError('Error de conexión al autenticar con Tableau Cloud.');
        }
      }
    };

    void loadToken();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefreshTableauData = async () => {
    setRefreshingViz(true);
    try {
      if (vizRef.current && typeof vizRef.current.refreshDataAsync === 'function') {
        await vizRef.current.refreshDataAsync();
      } else {
        await fetchTableauToken();
      }
    } catch (err) {
      console.error('Error al refrescar datos de Tableau:', err);
      await fetchTableauToken();
    } finally {
      setRefreshingViz(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      <Script
        src="https://10ax.online.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js"
        type="module"
        strategy="afterInteractive"
      />

      <header className="border-b border-[#2E323B] bg-[#121316]/95 backdrop-blur sticky top-0 z-30 px-4 py-3.5 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1E24] border border-[#2E323B] flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <Image
                src="/suth-logo.png"
                alt="Sutherland Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white">
                Dashboard Analítico &bull; Tableau Cloud
              </h1>
              <p className="text-xs text-zinc-400">
                Visualización &amp; Rendimiento Global en Tiempo Real
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshTableauData}
              disabled={refreshingViz}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1C1E24] hover:bg-[#252830] disabled:opacity-60 text-zinc-200 border border-[#2E323B] hover:border-[#0065FF] text-xs font-semibold transition flex items-center gap-2"
            >
              <span>{refreshingViz ? 'Actualizando...' : 'Actualizar Datos'}</span>
            </button>
            <Link
              href="/dashboard"
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold transition inline-flex items-center"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1">
        <div className="w-full p-4 sm:p-6 rounded-2xl bg-[#1C1E24] border border-[#2E323B] shadow-lg space-y-4">
          <div className="w-full block h-[70vh] sm:h-[80vh] lg:h-[85vh] rounded-xl bg-[#121316] border border-[#2E323B] overflow-hidden">
            {tokenError ? (
              <div className="p-8 text-center space-y-3 max-w-md mx-auto h-full flex flex-col items-center justify-center">
                <p className="text-xs text-rose-300 font-medium">{tokenError}</p>
                <button
                  type="button"
                  onClick={fetchTableauToken}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold transition"
                >
                  Reintentar autenticación
                </button>
              </div>
            ) : !jwtToken ? (
              <div className="flex items-center justify-center space-x-2.5 text-zinc-400 text-xs h-full">
                <svg className="animate-spin h-5 w-5 text-[#0065FF]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Autenticando sesión segura con Tableau Cloud...</span>
              </div>
            ) : (
              React.createElement('tableau-viz', {
                ref: (el: TableauVizElement | null) => {
                  vizRef.current = el;
                },
                id: 'tableauVizAnalyticsPage',
                src: TABLEAU_VIZ_URL,
                token: jwtToken,
                device: 'desktop',
                width: '100%',
                height: '100%',
                toolbar: 'hidden',
                'hide-tabs': true,
                style: {
                  width: '100%',
                  minWidth: '100%',
                  height: '100%',
                  display: 'block',
                },
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

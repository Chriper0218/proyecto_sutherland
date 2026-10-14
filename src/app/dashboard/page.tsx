'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        router.push('/');
        return;
      }
      setUser(JSON.parse(stored));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm font-medium">Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Barra superior */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Sutherland Platform</h1>
            <p className="text-xs text-slate-400">Sistema de Métricas y Estandarización (AHT)</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              isAdmin
                ? 'bg-purple-900/40 text-purple-300 border-purple-600/50'
                : 'bg-blue-900/40 text-blue-300 border-blue-600/50'
            }`}
          >
            {isAdmin ? '👑 Rol: Administrador' : '💼 Rol: Empleado'}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Banner de Bienvenida */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              ¡Bienvenido, {user.firstName} {user.lastName}!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Cédula / ID: <span className="text-slate-200 font-mono font-medium">{user.employeeId}</span> &bull; Correo:{' '}
              <span className="text-slate-200 font-medium">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Base de Datos Conectada (Neon)
            </span>
          </div>
        </div>

        {/* Panel de Módulos según Rol */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: Gestión de Turnos */}
          <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">Control de Turnos (Shift)</h3>
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Inactivo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Registra tu hora de entrada y salida para calcular la eficiencia de turno y disponibilidad.
            </p>
            <button className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition">
              Iniciar Nuevo Turno
            </button>
          </div>

          {/* Tarjeta 2: Tipos de Tareas & AHT */}
          <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">Tipos de Tareas (TaskMetric)</h3>
              <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                6 Tipos
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Estandarización de tiempos para notas operativas:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'KYC',
                'WATCHLIST_REVIEW',
                'RISK_REVIEW',
                'RECORD_KEEPING',
                'ENHANCED_DUE_DILIGENCE',
                'ENHANCED_KYC',
              ].map((task) => (
                <span
                  key={task}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                >
                  {task}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta 3: Panel Administrativo */}
          <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">
                {isAdmin ? 'Métricas Globales (Admin)' : 'Mi Rendimiento'}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded border ${
                  isAdmin
                    ? 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                    : 'text-slate-400 bg-slate-700/50 border-slate-600/50'
                }`}
              >
                {isAdmin ? 'Acceso Total' : 'Operativo'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {isAdmin
                ? 'Monitorea el AHT general de todos los empleados y turnos registrados en PostgreSQL.'
                : 'Consulta tus tiempos promedio de atención y notas generadas en el día.'}
            </p>
            <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              AHT Promedio: <span className="text-emerald-400 font-bold">0 seg</span> (Sin registros)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

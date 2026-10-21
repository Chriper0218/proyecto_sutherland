'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ================= TIPOS DE DATOS =================
export interface AgentTodayMetrics {
  totalTasks: number;
  avgAht: number; // en segundos
  efficiency: number; // porcentaje (0-100)
  targetStatus: 'IN_TARGET' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  statusColor: 'green' | 'orange' | 'red' | 'gray';
  alertMessage: string | null;
}

export interface AgentCoachingRecord {
  id: string;
  reason: string;
  ahtAtTime: number | null;
  createdAt: string;
  admin?: {
    firstName: string;
    lastName: string;
  };
}

export interface AgentRecentTask {
  id: string;
  taskType: string;
  durationSeconds: number;
  decision: string | null;
  createdAt: string;
}

export interface AgentData {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  coachingCount: number;
  suspendedUntil: string | null;
  isSuspended: boolean;
  liveStatus: 'ON_TASK' | 'SHIFT_NO_TASK' | 'OFF_SHIFT' | 'SUSPENDED';
  activeShift: { id: string; startTime: string } | null;
  hasActiveTask: boolean;
  currentTaskType: string | null;
  taskStartedAt: string | null;
  todayMetrics: AgentTodayMetrics;
  coachings: AgentCoachingRecord[];
  recentTasks: AgentRecentTask[];
}

export interface AdminSummary {
  totalAgents: number;
  agentsOnShift: number;
  agentsOffShift: number;
  agentsOnTask: number;
  agentsShiftNoTask: number;
  agentsSuspended: number;
  globalTasksCount: number;
  companyAvgAht: number;
  companyEfficiency: number;
  companyStatusColor: 'green' | 'orange' | 'red';
  targetAhtSeconds: number;
  taskDistribution: Record<string, number>;
}

interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface AdministradorProps {
  user: UserSession;
  onLogout: () => void;
  onSwitchToOperational?: () => void;
}

export default function Administrador({ user, onLogout, onSwitchToOperational }: AdministradorProps) {
  // Estado principal de agentes y resumen
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_SHIFT' | 'ON_TASK' | 'OFF_SHIFT' | 'CRITICAL' | 'SUSPENDED'>('ALL');
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'TABLEAU' | 'COACHINGS'>('MONITORING');

  // Modales
  // 1. Modal Mensaje Fantasma
  const [ghostModal, setGhostModal] = useState<{
    isOpen: boolean;
    agent: AgentData | null;
    message: string;
    submitting: boolean;
    feedback: string | null;
  }>({
    isOpen: false,
    agent: null,
    message: '',
    submitting: false,
    feedback: null,
  });

  // 2. Modal Coaching
  const [coachingModal, setCoachingModal] = useState<{
    isOpen: boolean;
    agent: AgentData | null;
    reason: string;
    submitting: boolean;
    feedback: string | null;
    error: string | null;
  }>({
    isOpen: false,
    agent: null,
    reason: '',
    submitting: false,
    feedback: null,
    error: null,
  });

  // 3. Modal Detalle de Agente
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentData | null>(null);

  // Estado Tableau Embed
  const [tableauUrl, setTableauUrl] = useState<string>('');

  // Formateadores de tiempo
  const formatSecondsToMMSS = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Función para consultar datos de agentes y métricas
  const fetchAgentsData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setSummary(data.summary || null);
        setLastUpdated(new Date());

        // Actualizar el agente seleccionado en detalle si sigue abierto
        setSelectedAgentDetail((currentDetail) => {
          if (!currentDetail) return null;
          const updated = (data.agents as AgentData[]).find((a) => a.id === currentDetail.id);
          return updated || currentDetail;
        });
      }
    } catch (err) {
      console.error('Error al obtener agentes y métricas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial y temporizador de polling (cada 5 segundos para tiempo real)
  useEffect(() => {
    let ignore = false;

    const doFetch = async () => {
      try {
        const res = await fetch('/api/admin/agents');
        if (res.ok && !ignore) {
          const data = await res.json();
          setAgents(data.agents || []);
          setSummary(data.summary || null);
          setLastUpdated(new Date());

          setSelectedAgentDetail((currentDetail) => {
            if (!currentDetail) return null;
            const updated = (data.agents as AgentData[]).find((a) => a.id === currentDetail.id);
            return updated || currentDetail;
          });
        }
      } catch (err) {
        console.error('Error al obtener agentes y métricas:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void doFetch();

    if (!autoRefresh) {
      return () => {
        ignore = true;
      };
    }

    const interval = setInterval(() => {
      void doFetch();
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [autoRefresh]);

  // Manejo de envío de Mensaje Fantasma
  const handleSendGhostMessage = async () => {
    if (!ghostModal.agent || !ghostModal.message.trim()) return;

    setGhostModal((prev) => ({ ...prev, submitting: true, feedback: null }));

    try {
      const res = await fetch('/api/admin/ghost-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: ghostModal.agent.id,
          adminId: user.id,
          message: ghostModal.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGhostModal((prev) => ({
          ...prev,
          submitting: false,
          feedback: `Error: ${data.error || 'No se pudo enviar el mensaje'}`,
        }));
      } else {
        setGhostModal((prev) => ({
          ...prev,
          submitting: false,
          feedback: `¡Mensaje fantasma enviado a la pantalla de ${ghostModal.agent?.firstName}!`,
          message: '',
        }));
        setTimeout(() => {
          setGhostModal({
            isOpen: false,
            agent: null,
            message: '',
            submitting: false,
            feedback: null,
          });
        }, 2200);
      }
    } catch (err) {
      console.error('Error al enviar mensaje fantasma:', err);
      setGhostModal((prev) => ({
        ...prev,
        submitting: false,
        feedback: 'Error de conexión al enviar el mensaje.',
      }));
    }
  };

  // Manejo de registro de Coaching
  const handleRegisterCoaching = async () => {
    if (!coachingModal.agent || !coachingModal.reason.trim()) {
      setCoachingModal((prev) => ({ ...prev, error: 'Por favor ingresa la razón de las demoras.' }));
      return;
    }

    setCoachingModal((prev) => ({ ...prev, submitting: true, error: null, feedback: null }));

    try {
      const res = await fetch('/api/admin/coachings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: coachingModal.agent.id,
          adminId: user.id,
          reason: coachingModal.reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCoachingModal((prev) => ({
          ...prev,
          submitting: false,
          error: data.error || 'Error al registrar el coaching',
        }));
      } else {
        setCoachingModal((prev) => ({
          ...prev,
          submitting: false,
          feedback: data.message || 'Coaching registrado exitosamente.',
          reason: '',
        }));
        await fetchAgentsData();
        setTimeout(() => {
          setCoachingModal({
            isOpen: false,
            agent: null,
            reason: '',
            submitting: false,
            feedback: null,
            error: null,
          });
        }, 2500);
      }
    } catch (err) {
      console.error('Error al registrar coaching:', err);
      setCoachingModal((prev) => ({
        ...prev,
        submitting: false,
        error: 'Error de conexión al registrar el coaching.',
      }));
    }
  };

  // Filtrado de agentes
  const filteredAgents = agents.filter((agent) => {
    const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      fullName.includes(query) ||
      agent.email.toLowerCase().includes(query) ||
      agent.employeeId.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (statusFilter === 'ON_SHIFT') return Boolean(agent.activeShift);
    if (statusFilter === 'ON_TASK') return Boolean(agent.activeShift && agent.hasActiveTask);
    if (statusFilter === 'OFF_SHIFT') return !agent.activeShift;
    if (statusFilter === 'CRITICAL') return agent.todayMetrics.statusColor === 'red';
    if (statusFilter === 'SUSPENDED') return agent.isSuspended;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* ================= HEADER ADMINISTRATIVO ================= */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-30 px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-900/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">Supervisión &amp; Administración</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Panel de Control General
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Tiempo Real (5s)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo de Agentes &bull; Control de AHT (Target: 10 min) &bull; Coachings &bull; Visualización Tableau
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onSwitchToOperational && (
              <button
                type="button"
                onClick={onSwitchToOperational}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 hover:border-blue-500/40 transition flex items-center gap-1.5 font-medium"
                title="Probar o usar el panel de notas estandarizadas"
              >
                <span>💼 Vista Operativa</span>
              </button>
            )}

            <div className="hidden sm:flex flex-col text-right pr-2 border-r border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[11px] text-purple-400 font-mono">ID Admin: {user.employeeId}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/30 transition duration-150 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* ================= 1. BARRA DE NAVEGACIÓN Y PESTAÑAS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('MONITORING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'MONITORING'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Monitoreo en Vivo de Agentes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TABLEAU')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'TABLEAU'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span>Métricas &amp; Gráficos Tableau</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COACHINGS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'COACHINGS'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Historial de Coachings &amp; Suspensión</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Última sincronización: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={() => fetchAgentsData()}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
              title="Refrescar datos manualmente"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Auto (5s)</span>
            </label>
          </div>
        </div>

        {/* ================= 2. TARJETAS DE RESUMEN GLOBAL (KPIS EN TIEMPO REAL) ================= */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total Agentes */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Agentes
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-white">{summary.totalAgents}</span>
                <span className="text-xs text-slate-400 font-semibold">Registrados</span>
              </div>
            </div>

            {/* Agentes en Turno */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-md">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>En Turno Activo</span>
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-emerald-300">{summary.agentsOnShift}</span>
                <span className="text-xs text-slate-400 font-semibold">de {summary.totalAgents}</span>
              </div>
            </div>

            {/* Agentes con Task Activo */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 shadow-md">
              <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Con Task Activo</span>
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-blue-300">{summary.agentsOnTask}</span>
                <span className="text-xs text-slate-400 font-semibold">En revisión</span>
              </div>
            </div>

            {/* Agentes en Turno Sin Task (Disponibles) */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-md">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                En Turno Sin Task
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-amber-300">{summary.agentsShiftNoTask}</span>
                <span className="text-xs text-slate-400 font-semibold">Esperando</span>
              </div>
            </div>

            {/* AHT Promedio Empresa */}
            <div
              className={`p-4 rounded-2xl border shadow-md ${
                summary.companyStatusColor === 'green'
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : summary.companyStatusColor === 'orange'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-rose-950/30 border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                  AHT Promedio Empresa
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    summary.companyStatusColor === 'green'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : summary.companyStatusColor === 'orange'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  Target: 10:00
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span
                  className={`text-2xl font-black font-mono ${
                    summary.companyStatusColor === 'green'
                      ? 'text-emerald-400'
                      : summary.companyStatusColor === 'orange'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatSecondsToMMSS(summary.companyAvgAht)}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {summary.globalTasksCount} casos hoy
                </span>
              </div>
            </div>

            {/* Eficiencia Global */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 shadow-md">
              <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                Eficiencia Global
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-purple-300">{summary.companyEfficiency}%</span>
                <span className="text-xs text-slate-400 font-semibold">Operativa</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 1: MONITOREO EN VIVO & AGENTES ================= */}
        {activeTab === 'MONITORING' && (
          <section className="space-y-4">
            {/* Barra de Filtros y Búsqueda */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar agente por nombre, correo o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Filtrar:</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Todos ({agents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ON_SHIFT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ON_SHIFT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                  }`}
                >
                  En Turno ({summary?.agentsOnShift || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ON_TASK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ON_TASK'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-blue-400 hover:text-blue-300 border border-slate-800'
                  }`}
                >
                  Con Task ({summary?.agentsOnTask || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('CRITICAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800'
                  }`}
                >
                  En Rojo (+2m)
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('SUSPENDED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'SUSPENDED'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-purple-400 hover:text-purple-300 border border-slate-800'
                  }`}
                >
                  Suspendidos ({summary?.agentsSuspended || 0})
                </button>
              </div>
            </div>

            {/* Listado de Agentes (Tarjetas Detalladas) */}
            {loading ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 flex flex-col items-center justify-center space-y-3">
                <svg className="animate-spin h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span className="text-sm font-medium">Cargando estado en vivo de los agentes...</span>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 space-y-2">
                <span className="text-3xl">👥</span>
                <h4 className="text-base font-bold text-white">No se encontraron agentes</h4>
                <p className="text-xs text-slate-400">
                  No hay agentes que coincidan con los filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => {
                  const m = agent.todayMetrics;
                  const isRed = m.statusColor === 'red';
                  const isOrange = m.statusColor === 'orange';
                  const isGreen = m.statusColor === 'green';

                  return (
                    <div
                      key={agent.id}
                      className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between shadow-xl relative overflow-hidden ${
                        agent.isSuspended
                          ? 'bg-purple-950/20 border-purple-500/40'
                          : isRed
                          ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                          : isOrange
                          ? 'bg-amber-950/15 border-amber-500/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Borde superior de color indicador */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          agent.isSuspended
                            ? 'bg-purple-500'
                            : isRed
                            ? 'bg-rose-500 animate-pulse'
                            : isOrange
                            ? 'bg-amber-500'
                            : isGreen
                            ? 'bg-emerald-500'
                            : 'bg-slate-700'
                        }`}
                      ></div>

                      {/* Header de la tarjeta del agente */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                              {agent.firstName.charAt(0)}
                              {agent.lastName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {agent.firstName} {agent.lastName}
                              </h3>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {agent.employeeId} &bull; {agent.email}
                              </span>
                            </div>
                          </div>

                          {/* Badge de Estado Operativo */}
                          {agent.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              ⛔ Suspendido 1 Día
                            </span>
                          ) : agent.liveStatus === 'ON_TASK' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              <span>Task Activo</span>
                            </span>
                          ) : agent.liveStatus === 'SHIFT_NO_TASK' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>Turno Disponible</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Fuera de Turno
                            </span>
                          )}
                        </div>

                        {/* Detalle del Task en progreso (si tiene) */}
                        {agent.hasActiveTask && (
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                              </svg>
                              <span className="font-semibold">
                                Trabajando en: <strong>{agent.currentTaskType || 'Nota'}</strong>
                              </span>
                            </div>
                            <span className="text-[10px] font-mono bg-blue-500/20 px-2 py-0.5 rounded">
                              En progreso
                            </span>
                          </div>
                        )}

                        {/* Métricas de AHT y Target de 10 min */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Casos Hoy</span>
                            <span className="text-base font-bold font-mono text-white">
                              {m.totalTasks}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">AHT Promedio</span>
                            <span
                              className={`text-base font-bold font-mono ${
                                isRed
                                  ? 'text-rose-400'
                                  : isOrange
                                  ? 'text-amber-400'
                                  : isGreen
                                  ? 'text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {m.totalTasks > 0 ? formatSecondsToMMSS(m.avgAht) : '--:--'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Eficiencia</span>
                            <span className="text-base font-bold font-mono text-purple-300">
                              {m.totalTasks > 0 ? `${m.efficiency}%` : '--'}
                            </span>
                          </div>
                        </div>

                        {/* Alerta de Target de 10 min */}
                        {m.totalTasks > 0 && (
                          <div
                            className={`p-2 rounded-lg text-[11px] font-medium border flex items-center justify-between ${
                              isRed
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : isOrange
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {isRed ? '🚨' : isOrange ? '⚠️' : '✓'}
                              <span>
                                {isRed
                                  ? 'Fuera de target (+2 min)'
                                  : isOrange
                                  ? 'Margen alerta (+1 a 2 min)'
                                  : 'En Target (<= 10 min)'}
                              </span>
                            </span>
                            <span className="font-mono text-[10px]">
                              Target: 10:00
                            </span>
                          </div>
                        )}

                        {/* Mensaje descriptivo de alerta */}
                        {m.alertMessage && (
                          <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20 leading-tight">
                            {m.alertMessage}
                          </p>
                        )}

                        {/* Estado de Coachings del Agente */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>
                            Coachings acumulados:{' '}
                            <strong
                              className={
                                agent.coachingCount >= 3
                                  ? 'text-rose-400'
                                  : agent.coachingCount > 0
                                  ? 'text-amber-400'
                                  : 'text-slate-300'
                              }
                            >
                              {agent.coachingCount} / 3 máx
                            </strong>
                          </span>
                          {agent.isSuspended && agent.suspendedUntil && (
                            <span className="text-rose-400 text-[10px] font-semibold">
                              Hasta: {new Date(agent.suspendedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                        {/* Botón Mensaje Fantasma */}
                        <button
                          type="button"
                          onClick={() => {
                            setGhostModal({
                              isOpen: true,
                              agent,
                              message: '',
                              submitting: false,
                              feedback: null,
                            });
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center justify-center gap-1.5 active:scale-95"
                          title="Enviar mensaje fantasma corto a la pantalla del agente"
                        >
                          <span>👻 Mensaje Fantasma</span>
                        </button>

                        {/* Botón Registrar Coaching (Habilitado especialmente si está en rojo o necesita coaching) */}
                        <button
                          type="button"
                          onClick={() => {
                            setCoachingModal({
                              isOpen: true,
                              agent,
                              reason: isRed
                                ? `AHT fuera de target (${formatSecondsToMMSS(m.avgAht)} min vs target 10 min). Demoras en validación operativa.`
                                : '',
                              submitting: false,
                              feedback: null,
                              error: null,
                            });
                          }}
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
                            isRed
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 font-bold active:scale-95'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                          title="Registrar coaching por demoras (máx 3 antes de suspensión por 1 día)"
                        >
                          <span>📝 Coaching</span>
                          {isRed && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                        </button>

                        {/* Botón Detalle */}
                        <button
                          type="button"
                          onClick={() => setSelectedAgentDetail(agent)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                          title="Ver métricas completas y gráficos de este agente"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ================= PESTAÑA 2: TABLEAU & GRÁFICOS VISUALES ================= */}
        {activeTab === 'TABLEAU' && summary && (
          <section className="space-y-6">
            {/* Banner de Tableau Analytics */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Tableau Analytics Suite
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Target Corporativo: 10 Minutos (600 seg)
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">Visualización &amp; Rendimiento Global</h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Evaluación continua del AHT general y la eficiencia en conjunto de toda la operación.
                    Estos gráficos generales son informativos para evaluar a la empresa como un todo.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">AHT General</span>
                    <span className="text-2xl font-black font-mono text-purple-300">
                      {formatSecondsToMMSS(summary.companyAvgAht)} min
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      {summary.companyAvgAht <= 600 ? '✓ En Target (<=10m)' : '+ Demoras detectadas'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Eficiencia General</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {summary.companyEfficiency}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Operación Sutherland</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico 1: Comparativa de AHT por Agente vs Target de 10 minutos */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    📊 Comparativa de AHT por Agente vs Línea Target (10 Minutos)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verde: En Target (&le; 10 min) &bull; Naranja: Alerta (&le; 12 min) &bull; Rojo: Crítico (&gt; 12 min)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span>&le; 10m</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span>
                    <span>10m - 12m</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500"></span>
                    <span>&gt; 12m</span>
                  </span>
                </div>
              </div>

              {/* Visualización de Barras de AHT estilo Tableau */}
              <div className="space-y-3 pt-3">
                {agents.map((ag) => {
                  const ahtSec = ag.todayMetrics.avgAht;
                  const targetSec = 600; // 10 min
                  // Porcentaje visual relativo al máximo (tope en 18 min = 1080s para escala)
                  const maxScaleSec = 1080;
                  const widthPercent = Math.min(100, Math.round((ahtSec / maxScaleSec) * 100));
                  const targetLinePercent = Math.round((targetSec / maxScaleSec) * 100);

                  const barColor =
                    ahtSec === 0
                      ? 'bg-slate-700'
                      : ahtSec <= 600
                      ? 'bg-emerald-500'
                      : ahtSec <= 720
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                  return (
                    <div key={ag.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          {ag.firstName} {ag.lastName}{' '}
                          <span className="text-[10px] text-slate-400 font-mono">({ag.employeeId})</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span>{ag.todayMetrics.totalTasks} tareas</span>
                          <span className="font-bold text-white">
                            {ahtSec > 0 ? `${formatSecondsToMMSS(ahtSec)} min` : 'Sin casos'}
                          </span>
                        </div>
                      </div>

                      <div className="relative h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                        {/* Línea de Target de 10 minutos */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                          style={{ left: `${targetLinePercent}%` }}
                          title="Target Objetivo: 10:00 minutos"
                        ></div>

                        {/* Barra de AHT del agente */}
                        <div
                          className={`h-full rounded transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white ${barColor}`}
                          style={{ width: `${Math.max(4, widthPercent)}%` }}
                        >
                          {ahtSec > 0 && formatSecondsToMMSS(ahtSec)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-right text-[11px] text-yellow-400/90 font-mono">
                &uarr; Línea vertical amarilla indica el Target Oficial de 10:00 minutos.
              </div>
            </div>

            {/* Gráfico 2: Distribución de Tareas por Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">
                  📂 Distribución de Tipos de Notas / Casos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(summary.taskDistribution).map(([typeKey, count]) => (
                    <div key={typeKey} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{typeKey}</span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conector Tableau Embed Interactivo */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    🌐 Conectar Dashboard Externo de Tableau
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Tableau Server / Public
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Inserta el enlace del libro de trabajo (Workbook) de Tableau para visualizar las hojas analíticas directamente:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://public.tableau.com/views/..."
                    value={tableauUrl}
                    onChange={(e) => setTableauUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tableauUrl) {
                        setTableauUrl('https://public.tableau.com/views/RiskComplianceAHTDashboard/Overview');
                      }
                    }}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    Cargar
                  </button>
                </div>
                {tableauUrl ? (
                  <div className="w-full h-64 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 text-xs">
                    <iframe
                      src={tableauUrl}
                      className="w-full h-full rounded-xl"
                      title="Tableau Embedded Dashboard"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs text-center p-4">
                    Ingresa una URL de Tableau arriba o presiona &ldquo;Cargar&rdquo; para previsualizar la integración.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= PESTAÑA 3: COACHINGS & AUDITORÍA DE SUSPENSIONES ================= */}
        {activeTab === 'COACHINGS' && (
          <section className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    📋 Auditoría de Coachings &amp; Políticas de Suspensión
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registro de retroalimentaciones aplicadas a los agentes por superar el AHT de 10 min. Límite: 3 coachings = 1 día de suspensión.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Regla de Cumplimiento Sutherland
                </span>
              </div>

              {/* Lista de Coachings Registrados */}
              <div className="space-y-3 pt-2">
                {agents.flatMap((a) =>
                  a.coachings.map((c) => ({
                    ...c,
                    agentName: `${a.firstName} ${a.lastName}`,
                    agentId: a.employeeId,
                    currentCoachingCount: a.coachingCount,
                    isSuspended: a.isSuspended,
                    suspendedUntil: a.suspendedUntil,
                  }))
                ).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No se han registrado coachings hasta el momento. La operación se encuentra dentro de los parámetros esperados.
                  </div>
                ) : (
                  agents
                    .flatMap((a) =>
                      a.coachings.map((c) => ({
                        ...c,
                        agentName: `${a.firstName} ${a.lastName}`,
                        agentId: a.employeeId,
                        currentCoachingCount: a.coachingCount,
                        isSuspended: a.isSuspended,
                        suspendedUntil: a.suspendedUntil,
                      }))
                    )
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.agentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {item.agentId}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30">
                              AHT al momento: {item.ahtAtTime ? `${formatSecondsToMMSS(item.ahtAtTime)} min` : 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            <strong>Razón de la demora:</strong> {item.reason}
                          </p>
                        </div>

                        <div className="text-right text-[11px] text-slate-400 font-mono">
                          <div>Registrado por: {item.admin ? `${item.admin.firstName} ${item.admin.lastName}` : 'Administrador'}</div>
                          <div>{new Date(item.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ================= MODAL: ENVIAR MENSAJE FANTASMA ================= */}
      {ghostModal.isOpen && ghostModal.agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setGhostModal({ isOpen: false, agent: null, message: '', submitting: false, feedback: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                👻
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Mensaje Fantasma en Pantalla
                </span>
                <h3 className="text-lg font-black text-white">
                  Supervisar a {ghostModal.agent.firstName} {ghostModal.agent.lastName}
                </h3>
                <p className="text-xs text-slate-400">
                  Este mensaje aparecerá como notificación flotante directa en la ventana activa del agente.
                </p>
              </div>
            </div>

            {/* Mensajes rápidos predefinidos */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Frases cortas sugeridas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '¿Por qué estás tardando tanto en este caso?',
                  'Por favor valida el corredor y confirma el documento.',
                  'Recuerda que el target de esta tarea es de 10 minutos.',
                  '¿Necesitas asistencia técnica de supervisión?',
                ].map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGhostModal((prev) => ({ ...prev, message: phrase }))}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de texto */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Escribe tu mensaje corto (máx 280 caracteres):
              </label>
              <textarea
                rows={3}
                maxLength={280}
                value={ghostModal.message}
                onChange={(e) => setGhostModal((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Ingresa tu pregunta o instrucción para el agente..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
              <span className="text-[10px] text-slate-500 font-mono text-right block mt-0.5">
                {ghostModal.message.length} / 280 caracteres
              </span>
            </div>

            {ghostModal.feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  ghostModal.feedback.startsWith('Error')
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {ghostModal.feedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGhostModal({ isOpen: false, agent: null, message: '', submitting: false, feedback: null })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ghostModal.submitting || !ghostModal.message.trim()}
                onClick={handleSendGhostMessage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                {ghostModal.submitting ? 'Enviando...' : 'Enviar Mensaje Fantasma'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR COACHING ================= */}
      {coachingModal.isOpen && coachingModal.agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setCoachingModal({ isOpen: false, agent: null, reason: '', submitting: false, feedback: null, error: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl flex-shrink-0">
                📝
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                  Registro de Coaching Disciplinario / AHT
                </span>
                <h3 className="text-lg font-black text-white">
                  Coaching para {coachingModal.agent.firstName} {coachingModal.agent.lastName}
                </h3>
                <p className="text-xs text-slate-300">
                  AHT Actual: <strong>{formatSecondsToMMSS(coachingModal.agent.todayMetrics.avgAht)} min</strong> (Target: 10 min).
                </p>
              </div>
            </div>

            {/* Alerta si está cerca de la suspensión (3er coaching) */}
            {coachingModal.agent.coachingCount >= 2 && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500 text-xs text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>ADVERTENCIA CRÍTICA: TERCER COACHING</span>
                </span>
                <p className="leading-relaxed">
                  El agente ya tiene {coachingModal.agent.coachingCount} coachings previos. Al registrar este coaching,
                  <strong> el perfil del agente se suspenderá automáticamente por 1 día completo (24 horas)</strong> y no podrá iniciar sesión.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Razón de las demoras y plan de coaching:
              </label>
              <textarea
                rows={4}
                value={coachingModal.reason}
                onChange={(e) => setCoachingModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Especifica la razón de la demora (ej. problemas técnicos con el portal de pasaportes, falta de claridad en el corridor, demoras injustificadas en la revisión de KYC)..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
              />
            </div>

            {coachingModal.error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {coachingModal.error}
              </div>
            )}

            {coachingModal.feedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                {coachingModal.feedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCoachingModal({ isOpen: false, agent: null, reason: '', submitting: false, feedback: null, error: null })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={coachingModal.submitting || !coachingModal.reason.trim()}
                onClick={handleRegisterCoaching}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                {coachingModal.submitting ? 'Registrando...' : 'Confirmar y Registrar Coaching'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETALLE COMPLETO DEL AGENTE ================= */}
      {selectedAgentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setSelectedAgentDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                {selectedAgentDetail.firstName.charAt(0)}
                {selectedAgentDetail.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedAgentDetail.firstName} {selectedAgentDetail.lastName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {selectedAgentDetail.employeeId} &bull; {selectedAgentDetail.email}
                </span>
              </div>
            </div>

            {/* Historial de Tareas de Hoy */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Últimas tareas completadas hoy:
              </h4>
              {selectedAgentDetail.recentTasks.length === 0 ? (
                <p className="text-xs text-slate-500">No hay tareas registradas hoy para este agente.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedAgentDetail.recentTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{t.taskType}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {new Date(t.createdAt).toLocaleTimeString()} &bull; Decisión: {t.decision || 'N/A'}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          t.durationSeconds <= 600
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : t.durationSeconds <= 720
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {formatSecondsToMMSS(t.durationSeconds)} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de Coachings */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Historial de Coachings ({selectedAgentDetail.coachings.length} registrados):
              </h4>
              {selectedAgentDetail.coachings.length === 0 ? (
                <p className="text-xs text-slate-500">El agente no tiene coachings registrados.</p>
              ) : (
                <div className="space-y-2">
                  {selectedAgentDetail.coachings.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-rose-300 font-semibold">
                        <span>Por: {c.admin ? `${c.admin.firstName} ${c.admin.lastName}` : 'Administrador'}</span>
                        <span className="font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-200">{c.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedAgentDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

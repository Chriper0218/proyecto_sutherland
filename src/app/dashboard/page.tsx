'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface ActiveShift {
  id: string;
  startTime: string;
}

// Lista de países representativos de América y Europa
const COUNTRIES_LIST = [
  'Estados Unidos',
  'Canadá',
  'México',
  'Colombia',
  'Brasil',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'Panamá',
  'Costa Rica',
  'Guatemala',
  'República Dominicana',
  'Uruguay',
  'Bolivia',
  'Paraguay',
  'Reino Unido',
  'España',
  'Francia',
  'Alemania',
  'Italia',
  'Portugal',
  'Países Bajos',
  'Suiza',
  'Bélgica',
  'Irlanda',
  'Suecia',
  'Noruega',
  'Dinamarca',
  'Polonia',
  'Austria',
];

export default function DashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // 1. Estado de Usuario
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 2. Estado de Turno (Shift Management)
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [shiftSeconds, setShiftSeconds] = useState<number>(0);
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [shiftLoading, setShiftLoading] = useState<boolean>(false);
  const [shiftMessage, setShiftMessage] = useState<string | null>(null);

  // 3. Estado de la Tarea KYC & Cronómetro AHT
  const [caseType, setCaseType] = useState<string>('');
  const [isTaskActive, setIsTaskActive] = useState<boolean>(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [taskSeconds, setTaskSeconds] = useState<number>(0);
  const [taskSubmitting, setTaskSubmitting] = useState<boolean>(false);
  const [taskSavedSuccess, setTaskSavedSuccess] = useState<string | null>(null);

  // 4. Métricas globales del día
  const [todayNotesCount, setTodayNotesCount] = useState<number>(0);
  const [todayAvgAht, setTodayAvgAht] = useState<number>(0);

  // 5. Estado del Formulario KYC
  const [kycForm, setKycForm] = useState({
    country: '',
    corridor: '',
    reviewedDocument: '',
    docNameDate: '',
    docLink: '',
    isPhotoVisible: '',
    isIdNumberVisible: '',
    isExpired: '',
    isDobMatch: '',
    isNameMatch: '',
    observations: '',
    reviewDecision: '',
    nextActions: '',
  });

  // 6. Estado del Botón de Copiado
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Referencias a los intervalos
  const shiftIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const taskIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Carga de Sesión ---
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('currentUser');
        if (!stored) {
          router.push('/');
          return;
        }
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        router.push('/');
      } finally {
        setLoadingUser(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  // --- Sincronizar Turno Activo y Métricas desde la BD ---
  useEffect(() => {
    if (!user?.id) return;

    const fetchShiftAndMetrics = async () => {
      try {
        // Consultar turno activo
        const resShift = await fetch(`/api/shifts?userId=${user.id}`);
        if (resShift.ok) {
          const dataShift = await resShift.json();
          if (dataShift.activeShift) {
            setActiveShift(dataShift.activeShift);
            setIsShiftActive(true);
            const startEpoch = new Date(dataShift.activeShift.startTime).getTime();
            const nowEpoch = Date.now();
            const elapsed = Math.max(0, Math.floor((nowEpoch - startEpoch) / 1000));
            setShiftSeconds(elapsed);
          }
        }

        // Consultar métricas del día
        const resMetrics = await fetch(`/api/tasks?userId=${user.id}`);
        if (resMetrics.ok) {
          const dataMetrics = await resMetrics.json();
          setTodayNotesCount(dataMetrics.totalNotesToday || 0);
          setTodayAvgAht(dataMetrics.avgAhtToday || 0);
        }
      } catch (err) {
        console.error('Error al sincronizar datos iniciales:', err);
      }
    };

    fetchShiftAndMetrics();
  }, [user?.id]);

  // --- Temporizador de Turno (HH:MM:SS) ---
  useEffect(() => {
    if (isShiftActive && activeShift?.startTime) {
      const startTimestamp = new Date(activeShift.startTime).getTime();

      shiftIntervalRef.current = setInterval(() => {
        const currentElapsed = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
        setShiftSeconds(currentElapsed);
      }, 1000);
    } else {
      if (shiftIntervalRef.current) {
        clearInterval(shiftIntervalRef.current);
        shiftIntervalRef.current = null;
      }
    }

    return () => {
      if (shiftIntervalRef.current) {
        clearInterval(shiftIntervalRef.current);
      }
    };
  }, [isShiftActive, activeShift]);

  // --- Temporizador de Tarea AHT (MM:SS) ---
  useEffect(() => {
    if (isTaskActive && taskStartTime) {
      const taskStartEpoch = taskStartTime.getTime();

      taskIntervalRef.current = setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - taskStartEpoch) / 1000));
        setTaskSeconds(elapsed);
      }, 1000);
    } else {
      if (taskIntervalRef.current) {
        clearInterval(taskIntervalRef.current);
        taskIntervalRef.current = null;
      }
    }

    return () => {
      if (taskIntervalRef.current) {
        clearInterval(taskIntervalRef.current);
      }
    };
  }, [isTaskActive, taskStartTime]);

  // --- Limpieza del timeout de copiado al desmontar ---
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Formateadores de tiempo
  const formatShiftTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatTaskTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // --- Acciones de Turno ---
  const handleStartShift = async () => {
    if (!user) return;
    setShiftLoading(true);
    setShiftMessage(null);

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setShiftMessage(data.error || 'Error al iniciar turno.');
        return;
      }

      setActiveShift(data.shift);
      setIsShiftActive(true);
      setShiftSeconds(0);
      setShiftMessage('¡Turno iniciado con éxito en la base de datos!');
      setTimeout(() => setShiftMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setShiftMessage('Error de conexión al iniciar el turno.');
    } finally {
      setShiftLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;
    setShiftLoading(true);
    setShiftMessage(null);

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'END', shiftId: activeShift.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setShiftMessage(data.error || 'Error al finalizar turno.');
        return;
      }

      setIsShiftActive(false);
      setActiveShift(null);
      setShiftSeconds(0);
      setShiftMessage('Turno finalizado correctamente.');
      setTimeout(() => setShiftMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setShiftMessage('Error de conexión al finalizar el turno.');
    } finally {
      setShiftLoading(false);
    }
  };

  // --- Selección del Tipo de Caso ---
  const handleCaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCaseType(selected);
    setTaskSavedSuccess(null);

    if (selected === 'KYC') {
      const now = new Date();
      setTaskStartTime(now);
      setTaskSeconds(0);
      setIsTaskActive(true);
    } else {
      setIsTaskActive(false);
      setTaskStartTime(null);
      setTaskSeconds(0);
    }
  };

  // --- Reiniciar Formulario para Nuevo Caso ---
  const handleResetForm = () => {
    setKycForm({
      country: '',
      corridor: '',
      reviewedDocument: '',
      docNameDate: '',
      docLink: '',
      isPhotoVisible: '',
      isIdNumberVisible: '',
      isExpired: '',
      isDobMatch: '',
      isNameMatch: '',
      observations: '',
      reviewDecision: '',
      nextActions: '',
    });
    setTaskSavedSuccess(null);
    const now = new Date();
    setTaskStartTime(now);
    setTaskSeconds(0);
    setIsTaskActive(true);
  };

  // --- Generación de Texto de la Nota según el Formato Solicitado ---
  const generateNoteText = (): string => {
    const country = kycForm.country.trim() || '[País]';
    const corridor = kycForm.corridor.trim() || '[Corridor]';
    const reviewedDoc = kycForm.reviewedDocument.trim() || '[Documento Revisado]';

    // Manejo de Document name, date + Link
    let docLine = '';
    if (kycForm.docNameDate.trim() && kycForm.docLink.trim()) {
      docLine = `${kycForm.docNameDate.trim()} | Link: ${kycForm.docLink.trim()}`;
    } else if (kycForm.docNameDate.trim()) {
      docLine = kycForm.docNameDate.trim();
    } else if (kycForm.docLink.trim()) {
      docLine = `Link: ${kycForm.docLink.trim()}`;
    } else {
      docLine = '[Nombre y Fecha según CRM + Enlace]';
    }

    const photoVisible = kycForm.isPhotoVisible || '[Yes/No]';
    const idNumberVisible = kycForm.isIdNumberVisible || '[Yes/No]';
    const expired = kycForm.isExpired || '[Yes/No]';
    const dobMatch = kycForm.isDobMatch || '[Yes/No]';
    const nameMatch = kycForm.isNameMatch || '[Yes/No]';

    const observations = kycForm.observations.trim() || '[Observaciones del analista]';
    const decision = kycForm.reviewDecision.trim() || '[Causa de aprobación o rechazo]';
    const nextActions = kycForm.nextActions.trim() || '[Próximas acciones]';

    return `*** KYC Review (${country}) ***

✔️ Corridor: ${corridor}
✔️ Reviewed Document: ${reviewedDoc}
${docLine}
▷ Is Photo Visible: ${photoVisible}
▷ Is Id Number Visible: ${idNumberVisible}
▷ Is it expired: ${expired}
▷ DOB Matches Customer Record: ${dobMatch}
▷ Name Matches Customer Record: ${nameMatch}

✔️ Observations:
${observations}

✔️ Review Decision: KYC review approved/denied due to ${decision}

✔️ Next agent actions: ${nextActions}`;
  };

  // --- Acción "Generar Nota" (Detener Temporizador y Guardar en Prisma) ---
  const handleGenerateNote = async () => {
    if (!user) return;
    if (!taskStartTime) return;

    // 1. Detener el contador de la tarea
    setIsTaskActive(false);
    const endTime = new Date();
    const duration = taskSeconds > 0 ? taskSeconds : Math.max(1, Math.round((endTime.getTime() - taskStartTime.getTime()) / 1000));

    setTaskSubmitting(true);
    setTaskSavedSuccess(null);

    try {
      // 2. Enviar métricas AHT al backend
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shiftId: activeShift ? activeShift.id : null,
          taskType: 'KYC',
          startTime: taskStartTime.toISOString(),
          endTime: endTime.toISOString(),
          durationSeconds: duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Error al guardar métrica:', data.error);
      } else {
        setTaskSavedSuccess(
          `¡Nota generada con éxito! Métrica registrada en Prisma: AHT de ${formatTaskTime(duration)} (${duration} seg).`
        );
        // Actualizar estadísticas en pantalla
        setTodayNotesCount((prev) => prev + 1);
        setTodayAvgAht((prev) => (prev === 0 ? duration : Math.round((prev + duration) / 2)));
      }
    } catch (err) {
      console.error('Error de red al guardar métrica:', err);
    } finally {
      setTaskSubmitting(false);
    }
  };

  // --- Botón de Copiado Inteligente al Portapapeles ---
  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = generateNoteText();
      await navigator.clipboard.writeText(textToCopy);

      setIsCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Fallo al copiar texto al portapapeles:', err);
    }
  };

  // --- Cerrar Sesión ---
  const handleLogout = () => {
    startTransition(() => {
      localStorage.removeItem('currentUser');
      router.push('/');
    });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="flex items-center space-x-3 bg-slate-800/80 px-6 py-4 rounded-xl border border-slate-700 shadow-xl">
          <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm font-medium">Cargando sesión y entorno de trabajo...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* ================= HEADER PRINCIPAL ================= */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">Sutherland Platform</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Risk & Compliance
              </span>
            </div>
            <p className="text-xs text-slate-400">Dashboard de Trabajo Operativo &bull; Estandarización de Notas (AHT)</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">ID: {user.employeeId}</span>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              isAdmin
                ? 'bg-purple-900/40 text-purple-300 border-purple-600/50'
                : 'bg-blue-900/40 text-blue-300 border-blue-600/50'
            }`}
          >
            {isAdmin ? '👑 Rol: Administrador' : '💼 Rol: Investigador KYC'}
          </span>

          <button
            onClick={handleLogout}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/30 transition duration-150 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* ================= 1. GESTIÓN DE TURNOS (SHIFT MANAGEMENT) ================= */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Información del Turno */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Control de Turno Laboral
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isShiftActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isShiftActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  ></span>
                  {isShiftActive ? 'Turno Activo en Base de Datos' : 'Sin Turno Activo'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gestión de Disponibilidad & Jornada
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Inicia tu jornada para registrar las métricas operacionales. Puedes iniciar y finalizar múltiples
                turnos al día sin restricciones.
              </p>
            </div>

            {/* Contador de Turno & Botones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
              <div className="flex flex-col pr-4 sm:border-r border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tiempo de Turno Actual
                </span>
                <span className="text-3xl font-mono font-black text-white tracking-wider">
                  {formatShiftTime(shiftSeconds)}
                </span>
                <span className="text-[10px] text-slate-500">Formato HH:MM:SS</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Botón Iniciar Turno */}
                <button
                  type="button"
                  onClick={handleStartShift}
                  disabled={isShiftActive || shiftLoading}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 ${
                    isShiftActive
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 active:scale-95'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Iniciar Turno</span>
                </button>

                {/* Botón Finalizar Turno */}
                <button
                  type="button"
                  onClick={handleEndShift}
                  disabled={!isShiftActive || shiftLoading}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 ${
                    !isShiftActive
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 active:scale-95'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span>Finalizar Turno</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notificación de Estado de Turno */}
          {shiftMessage && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{shiftMessage}</span>
            </div>
          )}
        </section>

        {/* ================= 2. SELECTOR DE CASO Y BARRA DE CRONÓMETRO AHT ================= */}
        <section className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label htmlFor="case-type-select" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>1. Seleccionar Tipo de Caso</span>
                <span className="text-[10px] text-blue-400 font-normal">(Requerido para iniciar cronómetro AHT)</span>
              </label>
              <div className="relative w-full sm:w-80">
                <select
                  id="case-type-select"
                  value={caseType}
                  onChange={handleCaseTypeChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium cursor-pointer"
                >
                  <option value="">-- Elige un tipo de caso --</option>
                  <option value="KYC">KYC Review (Proof of Identity)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cronómetro de Tarea / AHT (Visible al seleccionar KYC) */}
            {caseType === 'KYC' && (
              <div className="flex items-center gap-4 bg-slate-900/90 p-3.5 rounded-xl border border-blue-500/30 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTaskActive ? 'bg-emerald-400 opacity-75' : 'bg-slate-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isTaskActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Cronómetro AHT (Handle Time)
                    </span>
                    <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                      {formatTaskTime(taskSeconds)}
                    </span>
                  </div>
                </div>

                <div className="border-l border-slate-700/80 pl-3 hidden sm:block text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Estado: {isTaskActive ? 'En Progreso' : 'Pausado'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Formato MM:SS</span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta Informativa de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50">
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Notas Hoy</span>
              <p className="text-lg font-bold text-white font-mono">{todayNotesCount}</p>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">AHT Promedio</span>
              <p className="text-lg font-bold text-blue-400 font-mono">
                {todayAvgAht > 0 ? `${formatTaskTime(todayAvgAht)} min` : '00:00'}
              </p>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Turno Asociado</span>
              <p className="text-xs font-semibold text-slate-300 truncate mt-1">
                {activeShift ? `ID: ${activeShift.id.slice(0, 8)}...` : 'Ninguno (Libre)'}
              </p>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validación ID</span>
                <span className="text-xs font-bold text-slate-200">EdisonTD</span>
              </div>
              <a
                href="https://www.edisontd.nl/country-browser/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition flex items-center gap-1"
                title="Abrir navegador de pasaportes y documentos EdisonTD"
              >
                <span>Abrir</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ================= 3. GENERADOR DE NOTAS: CASO KYC (PROOF OF IDENTITY) ================= */}
        {caseType === 'KYC' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Formulario KYC (7 columnas) */}
            <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-xs font-mono">
                      ID
                    </span>
                    Formulario KYC: Proof of Identity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Completa todos los campos para estandarizar la nota de auditoría.
                  </p>
                </div>

                {/* Enlace Botón External Source */}
                <a
                  href="https://www.edisontd.nl/country-browser/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>EdisonTD Browser</span>
                </a>
              </div>

              {/* Campos Principales */}
              <div className="space-y-4">
                {/* 1. País & 2. Corridor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      1. País Emisor del Documento:
                    </label>
                    <select
                      value={kycForm.country}
                      onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Selecciona el País --</option>
                      {COUNTRIES_LIST.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      2. Corridor:
                    </label>
                    <input
                      type="text"
                      value={kycForm.corridor}
                      onChange={(e) => setKycForm({ ...kycForm, corridor: e.target.value })}
                      placeholder="Ej: USA -> COL o Domestic US"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 3. Reviewed Document */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    3. Reviewed Document (Type of ID Including Country or State):
                  </label>
                  <input
                    type="text"
                    value={kycForm.reviewedDocument}
                    onChange={(e) => setKycForm({ ...kycForm, reviewedDocument: e.target.value })}
                    placeholder="Ej: Driver's License - Florida, USA o Pasaporte - Colombia"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>

                {/* 4. Document Name & Date as on CRM + Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      4. Document Name and Date as on CRM:
                    </label>
                    <input
                      type="text"
                      value={kycForm.docNameDate}
                      onChange={(e) => setKycForm({ ...kycForm, docNameDate: e.target.value })}
                      placeholder="Ej: John Doe - Exp: 12/2028 - DOB: 05/14/1990"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Enlace / URL al CRM:
                    </label>
                    <input
                      type="url"
                      value={kycForm.docLink}
                      onChange={(e) => setKycForm({ ...kycForm, docLink: e.target.value })}
                      placeholder="https://crm.sutherland.internal/docs/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 5. Validaciones del ID (Yes / No) */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    5. Validaciones de Seguridad del ID
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Validation 1 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">Is Photo Visible?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isPhotoVisible: 'Yes' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isPhotoVisible === 'Yes'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isPhotoVisible: 'No' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isPhotoVisible === 'No'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Validation 2 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">Is Id Number Visible?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isIdNumberVisible: 'Yes' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isIdNumberVisible === 'Yes'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isIdNumberVisible: 'No' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isIdNumberVisible === 'No'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Validation 3 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">Is it expired?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isExpired: 'Yes' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isExpired === 'Yes'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isExpired: 'No' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isExpired === 'No'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Validation 4 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">DOB Matches Customer Record?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isDobMatch: 'Yes' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isDobMatch === 'Yes'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isDobMatch: 'No' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isDobMatch === 'No'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Validation 5 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700 sm:col-span-2">
                      <span className="text-slate-300">Name Matches Customer Record?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isNameMatch: 'Yes' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isNameMatch === 'Yes'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setKycForm({ ...kycForm, isNameMatch: 'No' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            kycForm.isNameMatch === 'No'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Observations */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    6. Observations:
                  </label>
                  <textarea
                    rows={2}
                    value={kycForm.observations}
                    onChange={(e) => setKycForm({ ...kycForm, observations: e.target.value })}
                    placeholder="Detalles adicionales sobre nitidez del documento, elementos holográficos, etc."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>

                {/* 7. Review Decision */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    7. Review Decision:
                    <span className="text-[11px] text-slate-400 font-normal ml-2">
                      (KYC review approved/denied due to...)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={kycForm.reviewDecision}
                    onChange={(e) => setKycForm({ ...kycForm, reviewDecision: e.target.value })}
                    placeholder="approved due to valid unexpired government ID matching all customer records"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>

                {/* 8. Next agent actions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    8. Next agent actions:
                  </label>
                  <textarea
                    rows={2}
                    value={kycForm.nextActions}
                    onChange={(e) => setKycForm({ ...kycForm, nextActions: e.target.value })}
                    placeholder="Ej: Proceder con la liberación de la transacción / Solicitar comprobante de domicilio"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Botón Principal: Generar Nota (Detiene Cronómetro y Guarda en Prisma) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateNote}
                  disabled={taskSubmitting}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {taskSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Guardando AHT en Base de Datos...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Generar Nota y Detener AHT</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-600 transition flex items-center justify-center gap-1.5"
                  title="Reiniciar campos y reiniciar cronómetro para un nuevo cliente"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Nueva Tarea</span>
                </button>
              </div>

              {/* Mensaje de Confirmación al Generar */}
              {taskSavedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-medium text-emerald-400 flex items-center gap-2 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{taskSavedSuccess}</span>
                </div>
              )}
            </div>

            {/* ================= 4. VISUALIZACIÓN Y BOTÓN DE COPIADO (CLIPBOARD) ================= */}
            <div className="lg:col-span-5 space-y-3 sticky top-24">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Cabecera del Bloc de Notas */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-300 ml-2">
                      Nota Generada (Audit Note)
                    </span>
                  </div>

                  {/* Botón de Copiado Inteligente */}
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 shadow-md ${
                      isCopied
                        ? 'bg-emerald-600 text-white border border-emerald-400 scale-105'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 active:scale-95'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copiar Nota</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Contenido de la Nota Formateada (Texto Exacto) */}
                <div className="p-4 sm:p-5 overflow-x-auto bg-slate-950 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-all">
                  <pre className="whitespace-pre-wrap break-words font-mono">
                    {generateNoteText()}
                  </pre>
                </div>

                {/* Pie de bloc de notas */}
                <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Plantilla: Estandarizada KYC</span>
                  <span>{isCopied ? 'Copiado al portapapeles' : 'Listo para copiar'}</span>
                </div>
              </div>

              {/* Guía Rápida para el Operador */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1.5">
                <span className="font-semibold text-slate-300 block">Instrucciones Operativas:</span>
                <p>
                  1. Completa las validaciones del documento verificando elementos en <span className="text-blue-400">EdisonTD</span>.
                </p>
                <p>
                  2. Haz clic en <span className="text-blue-400 font-semibold">&ldquo;Generar Nota y Detener AHT&rdquo;</span> para guardar el tiempo exacto en Prisma.
                </p>
                <p>
                  3. Presiona <span className="text-emerald-400 font-semibold">&ldquo;Copiar Nota&rdquo;</span> y pégala en el sistema CRM o herramienta de tickets.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Estado Vacío cuando no hay caso seleccionado */
          <div className="p-12 text-center rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white">Ningún caso en curso</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Selecciona <span className="text-blue-400 font-semibold">&ldquo;KYC Review&rdquo;</span> en el desplegable superior para iniciar el cronómetro AHT y cargar el generador de notas estandarizadas.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

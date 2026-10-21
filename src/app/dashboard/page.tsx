'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  KycFormData,
  initialKycFormData,
  RiskReviewFormData,
  initialRiskReviewFormData,
  RecordKeepingFormData,
  initialRecordKeepingFormData,
  WatchlistReviewFormData,
  initialWatchlistReviewFormData,
} from '@/components/notes/types';

import {
  generateKycNote,
  generateRiskReviewNote,
  generateRecordKeepingNote,
  generateWatchlistReviewNote,
} from '@/components/notes/generateNoteText';

import { KycReviewForm } from '@/components/notes/KycReviewForm';
import { RiskReviewForm } from '@/components/notes/RiskReviewForm';
import { RecordKeepingForm } from '@/components/notes/RecordKeepingForm';
import { WatchlistReviewForm } from '@/components/notes/WatchlistReviewForm';
import { NotePreviewCard } from '@/components/notes/NotePreviewCard';

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

type ActiveCaseType = 'KYC' | 'RISK_REVIEW' | 'RECORD_KEEPING' | 'WATCHLIST_REVIEW' | '';

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

  // 3. Estado de la Tarea & Cronómetro AHT
  const [caseType, setCaseType] = useState<ActiveCaseType>('');
  const [isTaskActive, setIsTaskActive] = useState<boolean>(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [taskSeconds, setTaskSeconds] = useState<number>(0);
  const [taskSubmitting, setTaskSubmitting] = useState<boolean>(false);
  const [taskSavedSuccess, setTaskSavedSuccess] = useState<string | null>(null);

  // 4. Métricas del día
  const [todayNotesCount, setTodayNotesCount] = useState<number>(0);
  const [todayAvgAht, setTodayAvgAht] = useState<number>(0);

  // 5. Estados de los Formularios Estandarizados
  const [kycForm, setKycForm] = useState<KycFormData>(initialKycFormData);
  const [riskForm, setRiskForm] = useState<RiskReviewFormData>(initialRiskReviewFormData);
  const [rkForm, setRkForm] = useState<RecordKeepingFormData>(initialRecordKeepingFormData);
  const [wlForm, setWlForm] = useState<WatchlistReviewFormData>(initialWatchlistReviewFormData);

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

  // --- Limpieza del timeout de copiado ---
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
      setShiftMessage('¡Turno iniciado con éxito en la base de datos! Ya puedes abrir y gestionar casos.');
      setTimeout(() => setShiftMessage(null), 4500);
    } catch (err) {
      console.error(err);
      setShiftMessage('Error de conexión al iniciar el turno.');
    } finally {
      setShiftLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift || !user) return;
    setShiftLoading(true);
    setShiftMessage(null);

    // Si había una tarea en progreso al cerrar turno, guardarla como tarea vacía/cerrada para métricas
    if (isTaskActive && taskStartTime && caseType) {
      const endTaskTime = new Date();
      const taskDuration =
        taskSeconds > 0 ? taskSeconds : Math.max(1, Math.round((endTaskTime.getTime() - taskStartTime.getTime()) / 1000));
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            shiftId: activeShift.id,
            taskType: caseType,
            startTime: taskStartTime.toISOString(),
            endTime: endTaskTime.toISOString(),
            durationSeconds: taskDuration,
            decision: 'CLOSED_AT_SHIFT_END',
            noteSummary: 'Turno finalizado con tarea en progreso',
          }),
        });
      } catch (err) {
        console.error('Error al guardar tarea pendiente al cerrar turno:', err);
      }
      setIsTaskActive(false);
      setCaseType('');
    }

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
      setCaseType('');
      setIsTaskActive(false);
      setTaskSeconds(0);
      setShiftMessage('Turno finalizado correctamente.');
      setTimeout(() => setShiftMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setShiftMessage('Error de conexión al finalizar el turno.');
    } finally {
      setShiftLoading(false);
    }
  };

  // --- Selección del Tipo de Caso (Bloqueado si no hay turno) ---
  const handleCaseTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isShiftActive) {
      alert('Debes iniciar un turno antes de seleccionar un caso.');
      return;
    }

    const selected = e.target.value as ActiveCaseType;
    if (selected === caseType) return;

    // Si el usuario ya tenía una tarea activa y cambia de caso, registrar la tarea previa
    if (isTaskActive && taskStartTime && caseType && user) {
      const endTime = new Date();
      const duration =
        taskSeconds > 0
          ? taskSeconds
          : Math.max(1, Math.round((endTime.getTime() - taskStartTime.getTime()) / 1000));

      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            shiftId: activeShift ? activeShift.id : null,
            taskType: caseType,
            startTime: taskStartTime.toISOString(),
            endTime: endTime.toISOString(),
            durationSeconds: duration,
            decision: 'SWITCHED_CASE',
            noteSummary: `Cambio de caso a ${selected || 'ninguno'}`,
          }),
        });

        setTodayNotesCount((prev) => prev + 1);
        setTodayAvgAht((prev) => (prev === 0 ? duration : Math.round((prev + duration) / 2)));
      } catch (err) {
        console.error('Error al registrar cambio de caso en métricas:', err);
      }
    }

    setCaseType(selected);
    setTaskSavedSuccess(null);

    if (selected) {
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

  // --- Acción: Nueva Tarea (Registra tarea vacía/incompleta en DB si ya había empezado una) ---
  const handleResetForm = async () => {
    if (!user || !caseType) return;

    // Si el usuario ya había iniciado una tarea (cronómetro corriendo o en curso sin haber generado la nota)
    if (isTaskActive && taskStartTime) {
      const endTime = new Date();
      const duration =
        taskSeconds > 0
          ? taskSeconds
          : Math.max(1, Math.round((endTime.getTime() - taskStartTime.getTime()) / 1000));

      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            shiftId: activeShift ? activeShift.id : null,
            taskType: caseType,
            startTime: taskStartTime.toISOString(),
            endTime: endTime.toISOString(),
            durationSeconds: duration,
            decision: 'DISCARDED_TASK',
            noteSummary: 'Tarea vacía o reiniciada por el operador',
          }),
        });

        // Actualizar contadores del día
        setTodayNotesCount((prev) => prev + 1);
        setTodayAvgAht((prev) => (prev === 0 ? duration : Math.round((prev + duration) / 2)));

        setTaskSavedSuccess(
          `Tarea anterior descartada y registrada en métricas de eficiencia (AHT: ${formatTaskTime(duration)}). Nueva tarea iniciada.`
        );
      } catch (err) {
        console.error('Error al registrar tarea descartada en la BD:', err);
      }
    } else {
      setTaskSavedSuccess(null);
    }

    // Reiniciar los campos del formulario según el caso actual
    if (caseType === 'KYC') {
      setKycForm(initialKycFormData);
    } else if (caseType === 'RISK_REVIEW') {
      setRiskForm(initialRiskReviewFormData);
    } else if (caseType === 'RECORD_KEEPING') {
      setRkForm(initialRecordKeepingFormData);
    } else if (caseType === 'WATCHLIST_REVIEW') {
      setWlForm(initialWatchlistReviewFormData);
    }

    // Iniciar nuevo cronómetro automáticamente para la siguiente tarea
    const now = new Date();
    setTaskStartTime(now);
    setTaskSeconds(0);
    setIsTaskActive(true);
  };

  // --- Generación del Texto Actual de la Nota ---
  const getCurrentNoteText = (): string => {
    switch (caseType) {
      case 'KYC':
        return generateKycNote(kycForm);
      case 'RISK_REVIEW':
        return generateRiskReviewNote(riskForm);
      case 'RECORD_KEEPING':
        return generateRecordKeepingNote(rkForm);
      case 'WATCHLIST_REVIEW':
        return generateWatchlistReviewNote(wlForm);
      default:
        return 'Selecciona un tipo de caso para generar la nota.';
    }
  };

  const getTemplateTitle = (): string => {
    switch (caseType) {
      case 'KYC':
        return 'KYC Review (Proof of Identity)';
      case 'RISK_REVIEW':
        return 'Risk Review (Fraud Review)';
      case 'RECORD_KEEPING':
        return 'Record Keeping Review';
      case 'WATCHLIST_REVIEW':
        return `Watchlist Review (${wlForm.matchType})`;
      default:
        return 'Estandarizada Compliance';
    }
  };

  // --- Acción "Generar Nota" (Detener Temporizador y Guardar en Prisma) ---
  const handleGenerateNote = async () => {
    if (!user || !taskStartTime || !caseType) return;

    // 1. Detener el contador de la tarea
    setIsTaskActive(false);
    const endTime = new Date();
    const duration =
      taskSeconds > 0
        ? taskSeconds
        : Math.max(1, Math.round((endTime.getTime() - taskStartTime.getTime()) / 1000));

    setTaskSubmitting(true);
    setTaskSavedSuccess(null);

    // 2. Extraer metadatos específicos del caso
    const noteText = getCurrentNoteText();
    let decision = '';
    let country = '';
    let corridor = '';
    let metadata: Record<string, unknown> = {};

    if (caseType === 'KYC') {
      decision = kycForm.reviewDecision;
      country = kycForm.country;
      corridor = kycForm.corridor;
      metadata = { ...kycForm };
    } else if (caseType === 'RISK_REVIEW') {
      decision = riskForm.kycStatus;
      corridor = riskForm.corridor;
      metadata = { ...riskForm };
    } else if (caseType === 'RECORD_KEEPING') {
      decision = rkForm.recordKeepingDecision;
      country = rkForm.country;
      metadata = { ...rkForm };
    } else if (caseType === 'WATCHLIST_REVIEW') {
      decision =
        wlForm.conclusion === 'TRUE_POSITIVE'
          ? `TRUE_POSITIVE: ${wlForm.truePositiveDisposition}`
          : 'FALSE_POSITIVE';
      country = wlForm.corridorCountry;
      corridor = wlForm.corridorCountry;
      metadata = { ...wlForm };
    }

    try {
      // 3. Enviar métricas AHT al backend
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shiftId: activeShift ? activeShift.id : null,
          taskType: caseType,
          startTime: taskStartTime.toISOString(),
          endTime: endTime.toISOString(),
          durationSeconds: duration,
          decision,
          country,
          corridor,
          noteSummary: noteText,
          metadata,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Error al guardar métrica:', data.error);
      } else {
        setTaskSavedSuccess(
          `¡Nota generada con éxito! Métrica registrada en Prisma: AHT de ${formatTaskTime(duration)} (${duration} seg).`
        );
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
      const textToCopy = getCurrentNoteText();
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
            {isAdmin ? '👑 Rol: Administrador' : '💼 Rol: Analista de Riesgo'}
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
                Debes iniciar turno para habilitar la gestión de casos y cronometrar el AHT. Puedes realizar
                múltiples turnos por día.
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
                <span>1. Seleccionar Tipo de Tarea / Caso</span>
                {!isShiftActive && (
                  <span className="text-[10px] text-amber-400 font-semibold">
                    (🔒 Bloqueado: Inicia turno primero)
                  </span>
                )}
              </label>

              <div className="relative w-full sm:w-96">
                <select
                  id="case-type-select"
                  disabled={!isShiftActive}
                  value={caseType}
                  onChange={handleCaseTypeChange}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm appearance-none font-medium transition ${
                    !isShiftActive
                      ? 'bg-slate-900/50 border-slate-700/60 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer'
                  }`}
                >
                  <option value="">
                    {!isShiftActive ? 'Inicia turno para habilitar' : '-- Elige un tipo de caso / nota --'}
                  </option>
                  <option value="KYC">🔍 KYC Review (Proof of Identity)</option>
                  <option value="RISK_REVIEW">🛡️ Risk Review (Fraud Review)</option>
                  <option value="RECORD_KEEPING">📁 Record Keeping Review (RK)</option>
                  <option value="WATCHLIST_REVIEW">🌐 Watchlist Review (Sender / Recipient)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {!isShiftActive && (
                <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 mt-1 font-medium">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Debes presionar &ldquo;Iniciar Turno&rdquo; antes de poder crear una nota.</span>
                </p>
              )}
            </div>

            {/* Cronómetro de Tarea / AHT (Visible al seleccionar cualquier caso) */}
            {caseType && (
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
                      Cronómetro AHT ({caseType})
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
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Notas / Tareas Hoy</span>
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

        {/* ================= 3. GENERADOR DE NOTAS SEGÚN EL TIPO DE CASO ================= */}
        {caseType && isShiftActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Formulario Dinámico (7 columnas) */}
            <div className="lg:col-span-7">
              {caseType === 'KYC' && (
                <KycReviewForm
                  form={kycForm}
                  setForm={setKycForm}
                  onSubmit={handleGenerateNote}
                  onReset={handleResetForm}
                  submitting={taskSubmitting}
                  successMessage={taskSavedSuccess}
                />
              )}

              {caseType === 'RISK_REVIEW' && (
                <RiskReviewForm
                  form={riskForm}
                  setForm={setRiskForm}
                  onSubmit={handleGenerateNote}
                  onReset={handleResetForm}
                  submitting={taskSubmitting}
                  successMessage={taskSavedSuccess}
                />
              )}

              {caseType === 'RECORD_KEEPING' && (
                <RecordKeepingForm
                  form={rkForm}
                  setForm={setRkForm}
                  onSubmit={handleGenerateNote}
                  onReset={handleResetForm}
                  submitting={taskSubmitting}
                  successMessage={taskSavedSuccess}
                />
              )}

              {caseType === 'WATCHLIST_REVIEW' && (
                <WatchlistReviewForm
                  form={wlForm}
                  setForm={setWlForm}
                  onSubmit={handleGenerateNote}
                  onReset={handleResetForm}
                  submitting={taskSubmitting}
                  successMessage={taskSavedSuccess}
                />
              )}
            </div>

            {/* Columna Derecha: Vista Previa y Botón de Copiado (5 columnas) */}
            <div className="lg:col-span-5">
              <NotePreviewCard
                noteText={getCurrentNoteText()}
                templateTitle={getTemplateTitle()}
                isCopied={isCopied}
                onCopy={handleCopyToClipboard}
                caseType={getTemplateTitle()}
              />
            </div>
          </div>
        ) : (
          /* Estado Vacío cuando no hay caso seleccionado o no hay turno activo */
          <div className="p-12 text-center rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white">
              {!isShiftActive ? 'Inicia un turno para comenzar' : 'Ningún caso en curso'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!isShiftActive
                ? 'El panel de notas y el cronómetro AHT requieren que tengas un turno de trabajo activo.'
                : 'Selecciona una plantilla en el menú desplegable superior (KYC, Risk Review, Record Keeping, Watchlist Review) para iniciar el cronómetro AHT.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

export interface ActiveCaseTimerProps {
  isTaskActive: boolean;
  taskStartedAt: string | Date | null;
  currentTaskType: string | null;
}

const TARGET_SECONDS = 600; // 10:00 minutos
const NEAR_LIMIT_SECONDS = 480; // 08:00 minutos (cerca del límite de 10:00)

function formatElapsedTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

export default function ActiveCaseTimer({
  isTaskActive,
  taskStartedAt,
  currentTaskType,
}: ActiveCaseTimerProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const startMs = taskStartedAt ? new Date(taskStartedAt).getTime() : NaN;
  const hasValidActiveCase = Boolean(
    isTaskActive && taskStartedAt && !Number.isNaN(startMs)
  );

  useEffect(() => {
    if (!hasValidActiveCase) {
      return;
    }

    const immediateTimer = setTimeout(() => {
      setNowMs(Date.now());
    }, 0);

    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearTimeout(immediateTimer);
      clearInterval(intervalId);
    };
  }, [hasValidActiveCase, taskStartedAt]);

  if (!hasValidActiveCase) {
    return (
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#121316] border border-[#2E323B] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 min-w-0">
          <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
          <span className="truncate font-medium">Sin caso activo</span>
        </div>
        <span className="font-mono tabular-nums text-[11px] text-zinc-500 shrink-0">
          --:--
        </span>
      </div>
    );
  }

  const elapsedSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  const isOverTarget = elapsedSeconds > TARGET_SECONDS;
  const isNearTarget =
    !isOverTarget && elapsedSeconds >= NEAR_LIMIT_SECONDS;

  const containerStyle = isOverTarget
    ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
    : isNearTarget
      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
      : 'bg-[#0052CC]/15 border-[#0052CC]/40 text-zinc-200';

  const dotStyle = isOverTarget
    ? 'bg-rose-500'
    : isNearTarget
      ? 'bg-amber-400'
      : 'bg-emerald-400';

  const timerTextStyle = isOverTarget
    ? 'text-rose-400'
    : isNearTarget
      ? 'text-amber-400'
      : 'text-emerald-400';

  const badgeStyle = isOverTarget
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : isNearTarget
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-[#0052CC]/25 text-[#4C9AFF] border-[#0065FF]/40';

  return (
    <div
      className={`mt-2.5 px-3 py-2 rounded-xl border transition-colors flex flex-wrap items-center justify-between gap-2 text-xs ${containerStyle}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyle}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotStyle}`}
          />
        </span>
        <span className="text-[11px] text-zinc-300 font-medium">Caso activo:</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border truncate ${badgeStyle}`}
        >
          {currentTaskType || 'EN CURSO'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <span
          className={`font-mono tabular-nums text-sm font-black tracking-wider ${timerTextStyle}`}
        >
          {formatElapsedTime(elapsedSeconds)}
        </span>
        <span className="text-[10px] font-mono text-zinc-400">
          / 10:00
        </span>
      </div>
    </div>
  );
}

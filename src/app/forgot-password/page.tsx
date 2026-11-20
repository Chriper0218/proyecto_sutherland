'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !lastName.trim() || !birthDate.trim()) {
      setError(
        'Por favor completa tu correo (o ID), primer apellido y fecha de nacimiento.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY',
          email,
          lastName,
          birthDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No fue posible verificar tu identidad.');
        return;
      }

      setSuccess(
        data.message ||
          'Identidad verificada correctamente. Ingresa tu nueva contraseña.'
      );
      setStep(2);
    } catch (err) {
      console.error('Error al verificar identidad:', err);
      setError('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6 || newPassword.length > 100) {
      setError('La nueva contraseña debe tener entre 6 y 100 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET',
          email,
          lastName,
          birthDate,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo actualizar la contraseña.');
        return;
      }

      setCompleted(true);
      setSuccess(
        data.message ||
          'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...'
      );
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/');
      }, 1800);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setError('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-zinc-100 flex flex-col justify-center items-center px-4 py-6 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="w-full max-w-md bg-[#1C1E24] border border-[#2E323B] rounded-2xl p-5 sm:p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#121316] border border-[#2E323B] flex items-center justify-center p-2 shadow-sm">
              <Image
                src="/suth-logo.png"
                alt="Sutherland Logo"
                width={50}
                height={50}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Recuperar Contraseña
          </h1>
          <p className="text-xs text-zinc-400">
            Valida tu identidad corporativa para definir una nueva contraseña de acceso.
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div
            className={`px-3 py-2.5 rounded-lg border font-semibold text-center transition ${
              step === 1
                ? 'bg-[#0052CC]/20 border-[#0065FF] text-[#4C9AFF]'
                : 'bg-[#121316] border-[#2E323B] text-zinc-400'
            }`}
          >
            1. Validación de Identidad
          </div>
          <div
            className={`px-3 py-2.5 rounded-lg border font-semibold text-center transition ${
              step === 2
                ? 'bg-[#0052CC]/20 border-[#0065FF] text-[#4C9AFF]'
                : 'bg-[#121316] border-[#2E323B] text-zinc-500'
            }`}
          >
            2. Nueva Contraseña
          </div>
        </div>

        {error && (
          <div className="bg-[#DE1B54]/10 border border-[#DE1B54]/40 text-[#F43F5E] text-sm p-3 rounded-lg flex items-center space-x-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#0052CC]/15 border border-[#0052CC]/40 text-[#4C9AFF] text-sm p-3 rounded-lg flex items-center space-x-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyIdentity} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Correo Corporativo o ID de Empleado:
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="usuario@sutherland.com o cédula"
                className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Primer Apellido:
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError('');
                }}
                placeholder="Ejm: Perez"
                className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Fecha de Nacimiento:
              </label>
              <input
                type="date"
                required
                disabled={loading}
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError('');
                }}
                className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Verificando identidad...</span> : <span>Verificar Identidad</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="px-3 py-2.5 rounded-lg bg-[#121316] border border-[#2E323B] text-xs text-zinc-300 flex items-center justify-between gap-2">
              <span className="truncate">
                Cuenta: <strong className="text-white">{email.trim().toLowerCase()}</strong>
              </span>
              {!completed && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccess('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-[#4C9AFF] hover:text-[#0065FF] font-medium shrink-0"
                >
                  Cambiar datos
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nueva contraseña:
              </label>
              <input
                type="password"
                required
                minLength={6}
                disabled={loading || completed}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Confirmar nueva contraseña:
              </label>
              <input
                type="password"
                required
                minLength={6}
                disabled={loading || completed}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || completed}
              className="w-full min-h-[44px] py-3 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Guardando contraseña...</span>
              ) : completed ? (
                <span>Contraseña Actualizada</span>
              ) : (
                <span>Guardar Nueva Contraseña</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-[#2E323B] text-center">
          <Link
            href="/"
            className="text-sm text-[#4C9AFF] hover:text-white font-medium transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

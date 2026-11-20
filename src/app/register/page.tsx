'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CORPORATE_EMAIL_ERROR_MESSAGE,
  INVALID_ADMIN_KEY_MESSAGE,
  isAdultBirthDate,
  isValidCorporateEmail,
  toTitleCase,
} from '@/lib/validation/userValidation';
import RegistrationGuideCard from '@/components/auth/RegistrationGuideCard';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    employeeId: '',
    email: '',
    accessKey: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [accessKeyFieldError, setAccessKeyFieldError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailFieldError(null);
    if (name === 'accessKey') setAccessKeyFieldError(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setEmailFieldError(null);
    setAccessKeyFieldError(null);

    const normalizedFirstName = formData.firstName.trim().toLowerCase();
    const normalizedLastName = formData.lastName.trim().toLowerCase();
    const normalizedEmail = formData.email.trim().toLowerCase();
    const trimmedEmployeeId = formData.employeeId.trim();
    const trimmedAccessKey = formData.accessKey.trim();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !formData.birthDate ||
      !trimmedEmployeeId
    ) {
      setError('Todos los campos marcados son obligatorios.');
      return;
    }

    if (!isValidCorporateEmail(normalizedEmail)) {
      setEmailFieldError(CORPORATE_EMAIL_ERROR_MESSAGE);
      setError(CORPORATE_EMAIL_ERROR_MESSAGE);
      return;
    }

    if (trimmedAccessKey !== '' && trimmedAccessKey !== 'SADMIN') {
      setAccessKeyFieldError(INVALID_ADMIN_KEY_MESSAGE);
      setError(INVALID_ADMIN_KEY_MESSAGE);
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 100) {
      setError('La contraseña debe tener entre 6 y 100 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isAdultBirthDate(formData.birthDate)) {
      setError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          birthDate: formData.birthDate,
          employeeId: trimmedEmployeeId,
          email: normalizedEmail,
          accessKey: trimmedAccessKey,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverError = data.error || 'Ocurrió un error al procesar el registro.';
        if (serverError === INVALID_ADMIN_KEY_MESSAGE) {
          setAccessKeyFieldError(serverError);
        } else if (serverError.toLowerCase().includes('correo')) {
          setEmailFieldError(serverError);
        }
        setError(serverError);
        return;
      }

      setSuccess(
        `¡Usuario ${toTitleCase(data.user.firstName)} ${toTitleCase(data.user.lastName)} creado con éxito (${data.user.role})! Redirigiendo al inicio de sesión...`
      );

      setFormData({
        firstName: '',
        lastName: '',
        birthDate: '',
        employeeId: '',
        email: '',
        accessKey: '',
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        router.push('/');
      }, 1800);
    } catch (err) {
      console.error('Error al registrar:', err);
      setError('Error de conexión con el servidor. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar adaptable */}
      <nav className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur border-b border-[#2E323B] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1E24] border border-[#2E323B] flex items-center justify-center p-1.5 shadow-sm">
              <Image
                src="/suth-logo.png"
                alt="Sutherland Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="block text-sm font-bold text-white leading-tight">
                Annotations Platform
              </span>
              <span className="block text-[11px] text-zinc-400 font-mono">
                Risk &amp; Compliance
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-[#1C1E24] border border-[#2E323B] hover:border-[#0065FF] transition inline-flex items-center justify-center"
          >
            ← Volver a Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Contenido Principal: Guía arriba en móvil / izquierda en escritorio + Formulario */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex">
          <RegistrationGuideCard />
        </div>

        <div className="flex">
          <div className="w-full h-full flex flex-col justify-between bg-[#1C1E24] p-5 sm:p-7 rounded-xl shadow-md border border-[#2E323B] space-y-5">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#121316] border border-[#2E323B] flex items-center justify-center p-2 shadow-sm">
                    <Image
                      src="/suth-logo.png"
                      alt="Sutherland Logo"
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Crear Cuenta
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                  Sistema de Estandarización de Registros y Métricas (AHT)
                </p>
              </div>

              {error && (
                <div className="bg-[#DE1B54]/10 border border-[#DE1B54]/40 text-[#F43F5E] text-sm p-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-[#0052CC]/15 border border-[#0052CC]/40 text-[#4C9AFF] text-sm p-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}
            </div>

            <form className="flex-1 flex flex-col justify-between space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Primer Nombre:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    disabled={loading}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                    placeholder="Ejm: Christian"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Primer Apellido:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    disabled={loading}
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                    placeholder="Ejm: Perez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Fecha de Nacimiento:
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    required
                    disabled={loading}
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Número de Cédula:
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    required
                    disabled={loading}
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                    placeholder="1000123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Correo Corporativo:
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => {
                    const trimmed = formData.email.trim().toLowerCase();
                    if (trimmed && !isValidCorporateEmail(trimmed)) {
                      setEmailFieldError(CORPORATE_EMAIL_ERROR_MESSAGE);
                    }
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none disabled:opacity-50 ${
                    emailFieldError
                      ? 'border-[#DE1B54] focus:border-[#DE1B54]'
                      : 'border-[#2E323B] focus:border-[#0065FF]'
                  }`}
                  placeholder="usuario@sutherland.com"
                />
                {emailFieldError && (
                  <p className="text-xs text-[#F43F5E] mt-1.5">{emailFieldError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Llave de Administrador{' '}
                  <span className="text-zinc-400 font-normal">
                    (Opcional — dejar vacío si eres empleado)
                  </span>
                  :
                </label>
                <input
                  type="text"
                  name="accessKey"
                  disabled={loading}
                  value={formData.accessKey}
                  onChange={handleChange}
                  className={`w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none disabled:opacity-50 font-mono ${
                    accessKeyFieldError
                      ? 'border-[#DE1B54] focus:border-[#DE1B54]'
                      : 'border-[#2E323B] focus:border-[#0065FF]'
                  }`}
                  placeholder="Dejar vacío si eres empleado"
                />
                {accessKeyFieldError && (
                  <p className="text-xs text-[#F43F5E] mt-1.5">{accessKeyFieldError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Confirmar:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    disabled={loading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3 py-2.5 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition duration-200 mt-2 flex items-center justify-center space-x-2"
              >
                {loading ? <span>Creando usuario...</span> : <span>Registrarse</span>}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[#2E323B]">
              <Link
                href="/"
                className="text-sm text-[#4C9AFF] hover:text-white font-medium transition-colors"
              >
                ¿Ya tienes una cuenta? Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

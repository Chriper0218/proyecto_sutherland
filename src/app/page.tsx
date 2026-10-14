'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  // Estados del formulario de Sign Up (Registro)
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    employeeId: '',
    email: '',
    accessKey: '',
    password: '',
    confirmPassword: '',
  });

  // Estados del formulario de Log In
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Mensajes de error, éxito y carga
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejo de cambios en los inputs de Registro
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  // Manejo de cambios en los inputs de Login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  // Validación de Mayoría de Edad (18 años)
  const validateAge = (dateString: string): boolean => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return false;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  // Envío del formulario de Registro
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Validar que las contraseñas coincidan
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 2. Validar mayoría de edad
    if (!validateAge(signUpData.birthDate)) {
      setError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al procesar el registro.');
        return;
      }

      setSuccess(
        `¡Usuario ${data.user.firstName} ${data.user.lastName} creado con éxito (${data.user.role})! Redirigiendo al inicio de sesión...`
      );

      // Limpiar formulario y cambiar al login
      setSignUpData({
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
        setIsSignUp(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error al registrar:', err);
      setError('Error de conexión con el servidor. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Envío del formulario de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas.');
        return;
      }

      // Guardar sesión en localStorage para persistencia básica
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      setSuccess(`¡Inicio de sesión exitoso! Ingresando como ${data.user.role}...`);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error de conexión con el servidor. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">

        {/* Encabezado */}
        <div>
          <div className="flex justify-center mb-2">
            <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
              S
            </span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {isSignUp
              ? 'Sistema de Estandarización de Registros y Métricas (AHT)'
              : 'Ingresa con tu cuenta corporativa'}
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Alerta de Éxito */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm p-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Formulario de REGISTRO (SIGN UP) */}
        {isSignUp ? (
          <form className="mt-6 space-y-4" onSubmit={handleSignUpSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombres: </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  disabled={loading}
                  value={signUpData.firstName}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="Ejm: Christian"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Apellidos: </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  disabled={loading}
                  value={signUpData.lastName}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="Ejm: Perez"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Nacimiento: </label>
                <input
                  type="date"
                  name="birthDate"
                  required
                  disabled={loading}
                  value={signUpData.birthDate}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cédula: </label>
                <input
                  type="text"
                  name="employeeId"
                  required
                  disabled={loading}
                  value={signUpData.employeeId}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="1000123456"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Corporativo: </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                value={signUpData.email}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                placeholder="agente@sutherlandglobal.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Llave de Acceso <span className="text-slate-500 font-normal">(Opcional para Admin)</span>:
              </label>
              <input
                type="password"
                name="accessKey"
                disabled={loading}
                value={signUpData.accessKey}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                placeholder="Ingresa la llave si eres Administrador"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña: </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  disabled={loading}
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmar: </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  disabled={loading}
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition duration-200 mt-2 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Creando usuario...</span>
                </>
              ) : (
                <span>Registrarse</span>
              )}
            </button>
          </form>
        ) : (
          /* Formulario de INICIO DE SESIÓN (LOG IN) */
          <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Corporativo: </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                placeholder="agente@sutherlandglobal.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña: </label>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition duration-200 mt-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>
        )}

        {/* Botón para alternar entre Login y Registro */}
        <div className="text-center pt-2 border-t border-slate-700">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium focus:outline-none disabled:opacity-50"
          >
            {isSignUp
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>

      </div>
    </div>
  );
}
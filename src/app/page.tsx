'use client';

import React, { useState } from 'react';

export default function AuthPage() {
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

  // Mensajes de error o éxito
  const [error, setError] = useState<string | null>(null);

  // Manejo de cambios en los inputs de Registro
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Manejo de cambios en los inputs de Login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Validación de Mayoría de Edad (18 años)
  const validateAge = (dateString: string): boolean => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  // Envío del formulario de Registro
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Aquí irá la petición a la API / Prisma más adelante
    console.log('Datos de registro válidos:', signUpData);
    alert('Registro procesado exitosamente (simulado)');
  };

  // Envío del formulario de Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos de inicio de sesión:', loginData);
    alert('Inicio de sesión procesado (simulado)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">

        {/* Encabezado */}
        <div>
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
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Formulario de REGISTRO (SIGN IN / SIGN UP) */}
        {isSignUp ? (
          <form className="mt-6 space-y-4" onSubmit={handleSignUpSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombres: </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={signUpData.firstName}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ejm: Christian"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Apellidos: </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={signUpData.lastName}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
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
                  value={signUpData.birthDate}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cédula: </label>
                <input
                  type="text"
                  name="employeeId"
                  required
                  value={signUpData.employeeId}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
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
                value={signUpData.email}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="agente@sutherlandglobal.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Llave de Acceso: </label>
              <input
                type="password"
                name="accessKey"
                required
                value={signUpData.accessKey}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Palabra clave del sistema"
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
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmar: </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-200 mt-2"
            >
              Registrarse
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
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="agente@sutherlandglobal.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña: </label>
              <input
                type="password"
                name="password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-200 mt-4"
            >
              Iniciar Sesión
            </button>
          </form>
        )}

        {/* Botón para alternar entre Login y Registro */}
        <div className="text-center pt-2 border-t border-slate-700">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
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
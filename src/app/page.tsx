'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // ================= TARJETA DE ACCESO (Login / Registro) =================
  const authCard = (
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">

        {/* Encabezado */}
        <div>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center p-2 shadow-xl shadow-blue-500/10 backdrop-blur">
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
                Llave de Acceso <span className="text-blue-400 font-normal">(Ingresa la llave de administrador)</span>:
              </label>
              <input
                type="text"
                name="accessKey"
                disabled={loading}
                value={signUpData.accessKey}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono uppercase"
                placeholder="Si eres Agente, este campo es opcional"
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
                placeholder="usuario@sutherlandglobal.com"
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
  );

  // ================= NAVEGACIÓN DE LA PÁGINA DE INICIO =================
  const scrollToId = (id: string) => {
    setMobileMenuOpen(false);
    // Esperar al re-render (por si cambia la vista entre login/registro)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const goToHome = () => {
    setIsSignUp(false);
    setError(null);
    setSuccess(null);
    scrollToId('inicio');
  };

  const goToLogin = () => {
    setIsSignUp(false);
    setError(null);
    setSuccess(null);
    scrollToId('acceso');
  };

  const goToRegister = () => {
    setIsSignUp(true);
    setError(null);
    setSuccess(null);
    scrollToId('inicio');
  };

  const goToMoreInfo = () => scrollToId('mas-info');

  const navItems: { label: string; onClick: () => void; active: boolean }[] = [
    { label: 'Inicio', onClick: goToHome, active: !isSignUp },
    { label: 'Iniciar Sesión', onClick: goToLogin, active: false },
    { label: 'Registro', onClick: goToRegister, active: isSignUp },
    { label: 'Más Info', onClick: goToMoreInfo, active: false },
  ];

  const noteModules = [
    {
      icon: '🔍',
      title: 'KYC Review',
      desc: 'Verificación de identidad (Proof of Identity) con validaciones condicionales de documento, país y corredor.',
    },
    {
      icon: '🌐',
      title: 'Watchlist Review',
      desc: 'Revisión de coincidencias en listas de control (Sender / Recipient) con disposición True / False Positive.',
    },
    {
      icon: '🛡️',
      title: 'Risk Review',
      desc: 'Evaluación de riesgo y fraude con estructura estandarizada para la toma de decisiones.',
    },
    {
      icon: '📁',
      title: 'Record Keeping Review',
      desc: 'Registro y conservación de evidencia para auditoría bajo un formato homogéneo.',
    },
  ];

  const benefits = [
    {
      title: 'Estandarización',
      desc: 'Cada nota sigue la misma estructura sin importar el analista que la redacte.',
    },
    {
      title: 'Reducción del AHT',
      desc: 'Las notas se generan en segundos, disminuyendo el tiempo promedio por caso (Average Handle Time).',
    },
    {
      title: 'Cumplimiento regulatorio',
      desc: 'Los formularios condicionales evitan la omisión de información regulatoria esencial.',
    },
    {
      title: 'Supervisión en tiempo real',
      desc: 'Panel administrativo con métricas de AHT, eficiencia, coachings y monitoreo de agentes.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button type="button" onClick={goToHome} className="flex items-center gap-3 focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-md shadow-blue-500/10">
              <Image
                src="/suth-logo.png"
                alt="Sutherland Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white leading-tight">Annotations Platform</span>
              <span className="block text-[11px] text-slate-400 font-mono">Risk &amp; Compliance</span>
            </div>
          </button>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  item.active
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 border border-slate-700"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Links móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-1 bg-slate-900">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  item.active ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main id="inicio" className="flex-1 scroll-mt-20">
        {isSignUp ? (
          /* Vista de REGISTRO: se mantiene la misma visual centrada */
          <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">{authCard}</div>
        ) : (
          <>
            {/* ===== HERO + LOGIN LATERAL DERECHO ===== */}
            <section className="relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-40 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Información del proyecto (izquierda) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      Proyecto de Prácticas Profesionales
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      Ingeniería de Sistemas &bull; Universidad de la Costa
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    Estandarización de notas de cumplimiento{' '}
                    <span className="bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">
                      en segundos
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    Aplicación web de soporte operacional enfocada en el área de investigación de{' '}
                    <strong className="text-white">cumplimiento financiero y riesgo</strong>. La herramienta aborda la
                    ineficiencia y la variabilidad en la redacción manual de registros de auditoría, estandarizando la
                    creación de notas mediante una interfaz interactiva y condicional.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <span className="block text-2xl font-black font-mono text-blue-300">4</span>
                      <span className="block text-xs text-slate-400">Plantillas de notas estandarizadas</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <span className="block text-2xl font-black font-mono text-emerald-300">10:00</span>
                      <span className="block text-xs text-slate-400">Target de AHT por caso (minutos)</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <span className="block text-2xl font-black font-mono text-rose-300">Tiempo real</span>
                      <span className="block text-xs text-slate-400">Métricas y supervisión de agentes</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={goToRegister}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
                    >
                      Crear cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToId('proyecto')}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
                    >
                      Conocer el proyecto
                    </button>
                  </div>
                </div>

                {/* Inicio de sesión (lateral derecho) */}
                <div id="acceso" className="lg:col-span-5 flex justify-center lg:justify-end scroll-mt-24 lg:sticky lg:top-24">
                  {authCard}
                </div>
              </div>
            </section>

            {/* ===== PROPUESTA / PROBLEMA Y SOLUCIÓN ===== */}
            <section id="proyecto" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">El problema</span>
                  <h2 className="text-xl font-bold text-white">Redacción manual e inconsistente</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    La redacción manual de notas de cumplimiento para KYC, Watchlist Reviews, Risk Reviews y Record
                    Keeping Reviews genera variabilidad entre analistas, aumenta el tiempo por caso y expone a la
                    operación a la omisión de información regulatoria esencial.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">La solución</span>
                  <h2 className="text-xl font-bold text-white">Interfaz interactiva y condicional</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    El sistema estandariza la creación de notas en segundos, guiando al analista con formularios
                    condicionales. Esto disminuye considerablemente el tiempo promedio por caso{' '}
                    <strong className="text-white">(Average Handle Time - AHT)</strong> y asegura que cada registro
                    contenga la información requerida.
                  </p>
                </div>
              </div>
            </section>

            {/* ===== MÓDULOS DE NOTAS ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <h2 className="text-2xl font-black text-white mb-1">Tipos de revisión soportados</h2>
              <p className="text-sm text-slate-400 mb-6">Plantillas estandarizadas para cada flujo de investigación.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {noteModules.map((m) => (
                  <div key={m.title} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-blue-500/40 transition">
                    <span className="text-2xl">{m.icon}</span>
                    <h3 className="mt-2 text-sm font-bold text-white">{m.title}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== BENEFICIOS ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <h2 className="text-2xl font-black text-white mb-6">Beneficios para la operación</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((b) => (
                  <div key={b.title} className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-sm font-bold">
                      ✓
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white">{b.title}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== CONTEXTO ACADÉMICO ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-rose-950/40 border border-slate-700 flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-4xl">🎓</div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white">Proyecto académico de prácticas profesionales</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Desarrollado como proyecto de prácticas profesionales del programa de{' '}
                    <strong className="text-white">Ingeniería de Sistemas</strong> de la{' '}
                    <strong className="text-white">Universidad de la Costa (CUC)</strong>, en Barranquilla, Colombia,
                    en colaboración con el área de Risk &amp; Compliance de Sutherland.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ================= FOOTER / MÁS INFO ================= */}
      <footer id="mas-info" className="border-t border-slate-800 bg-slate-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center p-1.5">
                <Image src="/suth-logo.png" alt="Sutherland Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white">Annotations Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aplicación web de soporte operacional para la estandarización de notas de cumplimiento financiero y riesgo.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Desarrollador</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="text-white font-semibold">Christian Pérez Vega</li>
              <li>
                <a href="tel:+573002003376" className="hover:text-blue-300 transition">
                  📞 +57 300 200 3376
                </a>
              </li>
              <li>
                <a href="mailto:chriper18@gmail.com" className="hover:text-blue-300 transition">
                  ✉️ chriper18@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Contexto académico</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Proyecto de prácticas profesionales &bull; Ingeniería de Sistemas
              <br />
              Universidad de la Costa (CUC)
              <br />
              Barranquilla, Colombia
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} Christian Pérez Vega &bull; Universidad de la Costa &bull; Barranquilla, Colombia
        </div>
      </footer>
    </div>
  );
}

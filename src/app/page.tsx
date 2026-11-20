'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isValidCorporateEmail, toTitleCase } from '@/lib/validation/userValidation';

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

  // Estados del modal de recuperación de contraseña (2 pasos)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLastName, setForgotLastName] = useState('');
  const [forgotBirthDate, setForgotBirthDate] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotCompleted, setForgotCompleted] = useState(false);

  const openForgotModal = () => {
    setForgotStep(1);
    setForgotEmail(loginData.email.trim());
    setForgotLastName('');
    setForgotBirthDate('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setForgotCompleted(false);
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    if (forgotLoading) return;
    setShowForgotModal(false);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setForgotCompleted(false);
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim() || !forgotLastName.trim() || !forgotBirthDate.trim()) {
      setForgotError(
        'Por favor completa tu correo (o ID), primer apellido y fecha de nacimiento.'
      );
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY',
          email: forgotEmail,
          lastName: forgotLastName,
          birthDate: forgotBirthDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'No fue posible verificar tu identidad.');
        return;
      }

      setForgotSuccess(
        data.message ||
          'Identidad verificada correctamente. Ingresa tu nueva contraseña.'
      );
      setForgotStep(2);
    } catch (err) {
      console.error('Error al verificar identidad:', err);
      setForgotError('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPassword.length < 6 || forgotNewPassword.length > 100) {
      setForgotError('La nueva contraseña debe tener entre 6 y 100 caracteres.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Las contraseñas no coinciden.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET',
          email: forgotEmail,
          lastName: forgotLastName,
          birthDate: forgotBirthDate,
          newPassword: forgotNewPassword,
          confirmPassword: forgotConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'No se pudo actualizar la contraseña.');
        return;
      }

      const normalizedIdentifier = forgotEmail.trim().toLowerCase();
      setForgotCompleted(true);
      setForgotSuccess(
        data.message ||
          'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.'
      );
      setForgotNewPassword('');
      setForgotConfirmPassword('');

      if (normalizedIdentifier.includes('@')) {
        setLoginData({ email: normalizedIdentifier, password: '' });
      } else {
        setLoginData((prev) => ({ ...prev, password: '' }));
      }
      setError(null);
      setSuccess('Contraseña actualizada. Ya puedes iniciar sesión con tu nueva clave.');

      setTimeout(() => {
        setShowForgotModal(false);
        setForgotCompleted(false);
        setForgotSuccess('');
      }, 1800);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setForgotError('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setForgotLoading(false);
    }
  };

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

    // 1. Validar que los campos obligatorios no contengan solo espacios
    if (
      !signUpData.firstName.trim() ||
      !signUpData.lastName.trim() ||
      !signUpData.employeeId.trim() ||
      !signUpData.email.trim()
    ) {
      setError('Todos los campos marcados son obligatorios.');
      return;
    }

    // 2. Validar dominio del correo corporativo
    if (!isValidCorporateEmail(signUpData.email.trim())) {
      setError('Debe ingresar un correo corporativo válido');
      return;
    }

    // 3. Validar que las contraseñas coincidan
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 4. Validar mayoría de edad
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
        `¡Usuario ${toTitleCase(data.user.firstName)} ${toTitleCase(data.user.lastName)} creado con éxito (${data.user.role})! Redirigiendo al inicio de sesión...`
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
    <div className="max-w-md w-full space-y-8 bg-[#1C1E24] p-8 rounded-xl shadow-md border border-[#2E323B]">

      {/* Encabezado */}
      <div>
        <div className="flex justify-center mb-3">
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
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {isSignUp
            ? 'Sistema de Estandarización de Registros y Métricas (AHT)'
            : 'Ingresa con tu cuenta corporativa'}
        </p>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-[#DE1B54]/10 border border-[#DE1B54]/40 text-[#F43F5E] text-sm p-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Alerta de Éxito */}
      {success && (
        <div className="bg-[#0052CC]/15 border border-[#0052CC]/40 text-[#4C9AFF] text-sm p-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nombres: </label>
              <input
                type="text"
                name="firstName"
                required
                disabled={loading}
                value={signUpData.firstName}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                placeholder="Ejm: Christian"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Apellidos: </label>
              <input
                type="text"
                name="lastName"
                required
                disabled={loading}
                value={signUpData.lastName}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                placeholder="Ejm: Perez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Fecha Nacimiento: </label>
              <input
                type="date"
                name="birthDate"
                required
                disabled={loading}
                value={signUpData.birthDate}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Cédula: </label>
              <input
                type="text"
                name="employeeId"
                required
                disabled={loading}
                value={signUpData.employeeId}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                placeholder="1000123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Correo Corporativo: </label>
            <input
              type="email"
              name="email"
              required
              disabled={loading}
              value={signUpData.email}
              onChange={handleSignUpChange}
              className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              placeholder="agente@sutherland.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Llave de Acceso <span className="text-zinc-400 font-normal">(Ingresa la llave de administrador)</span>:
            </label>
            <input
              type="text"
              name="accessKey"
              disabled={loading}
              value={signUpData.accessKey}
              onChange={handleSignUpChange}
              className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50 font-mono uppercase"
              placeholder="Si eres Agente, este campo es opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Contraseña: </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                disabled={loading}
                value={signUpData.password}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Confirmar: </label>
              <input
                type="password"
                name="confirmPassword"
                required
                disabled={loading}
                value={signUpData.confirmPassword}
                onChange={handleSignUpChange}
                className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition duration-200 mt-2 flex items-center justify-center space-x-2"
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
            <label className="block text-xs font-medium text-zinc-300 mb-1">Correo Corporativo: </label>
            <input
              type="email"
              name="email"
              required
              disabled={loading}
              value={loginData.email}
              onChange={handleLoginChange}
              className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              placeholder="usuario@sutherland.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">Contraseña: </label>
              <button
                type="button"
                disabled={loading}
                onClick={openForgotModal}
                className="text-xs font-medium text-[#4C9AFF] hover:text-[#0065FF] transition-colors focus:outline-none disabled:opacity-50"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input
              type="password"
              name="password"
              required
              disabled={loading}
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition duration-200 mt-4 flex items-center justify-center space-x-2"
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
      <div className="text-center pt-2 border-t border-[#2E323B]">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-[#4C9AFF] hover:text-white font-medium focus:outline-none disabled:opacity-50"
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
    <div className="min-h-screen bg-[#121316] text-zinc-100 flex flex-col font-sans">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur border-b border-[#2E323B] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button type="button" onClick={goToHome} className="flex items-center gap-3 focus:outline-none">
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
            <div className="text-left">
              <span className="block text-sm font-bold text-white leading-tight">Annotations Platform</span>
              <span className="block text-[11px] text-zinc-400 font-mono">Risk &amp; Compliance</span>
            </div>
          </button>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${item.active
                    ? 'bg-[#0052CC] text-white border border-[#0065FF]'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1C1E24] border border-transparent'
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
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:bg-[#1C1E24] border border-[#2E323B]"
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
          <div className="md:hidden border-t border-[#2E323B] px-4 py-3 space-y-1 bg-[#121316]">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${item.active ? 'bg-[#0052CC] text-white' : 'text-zinc-300 hover:bg-[#1C1E24]'
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
              <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-40 right-0 w-96 h-96 bg-transparent rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Información del proyecto (izquierda) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1C1E24] text-zinc-200 border border-[#2E323B]">
                      Proyecto de Prácticas Profesionales
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0052CC]/15 text-[#4C9AFF] border border-[#0052CC]/40">
                      Ingeniería de Sistemas &bull; Universidad de la Costa
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    Estandarización de notas de cumplimiento{' '}
                    <span className="text-[#DE1B54]">
                      en segundos
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                    Aplicación web de soporte operacional enfocada en el área de investigación de{' '}
                    <strong className="text-white">cumplimiento financiero y riesgo</strong>. La herramienta aborda la
                    ineficiencia y la variabilidad en la redacción manual de registros de auditoría, estandarizando la
                    creación de notas mediante una interfaz interactiva y condicional.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    <div className="p-4 rounded-2xl bg-[#1C1E24] border border-[#2E323B]">
                      <span className="block text-2xl font-black font-mono text-white">4</span>
                      <span className="block text-xs text-zinc-400">Plantillas de notas estandarizadas</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1C1E24] border border-[#2E323B]">
                      <span className="block text-2xl font-black font-mono text-white">10:00</span>
                      <span className="block text-xs text-zinc-400">Target de AHT por caso (minutos)</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1C1E24] border border-[#2E323B]">
                      <span className="block text-2xl font-black font-mono text-[#4C9AFF]">Tiempo real</span>
                      <span className="block text-xs text-zinc-400">Métricas y supervisión de agentes</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={goToRegister}
                      className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-semibold shadow-sm transition"
                    >
                      Crear cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToId('proyecto')}
                      className="px-5 py-2.5 rounded-xl bg-[#1C1E24] hover:bg-[#252830] text-zinc-100 text-sm font-semibold border border-[#2E323B] transition"
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
                <div className="p-6 rounded-2xl bg-[#1C1E24] border border-[#2E323B] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">El problema</span>
                  <h2 className="text-xl font-bold text-white">Redacción manual e inconsistente</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    La redacción manual de notas de cumplimiento para KYC, Watchlist Reviews, Risk Reviews y Record
                    Keeping Reviews genera variabilidad entre analistas, aumenta el tiempo por caso y expone a la
                    operación a la omisión de información regulatoria esencial.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#1C1E24] border border-[#2E323B] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4C9AFF] font-mono">La solución</span>
                  <h2 className="text-xl font-bold text-white">Interfaz interactiva y condicional</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">
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
              <p className="text-sm text-zinc-400 mb-6">Plantillas estandarizadas para cada flujo de investigación.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {noteModules.map((m) => (
                  <div key={m.title} className="p-5 rounded-2xl bg-[#1C1E24] border border-[#2E323B] hover:border-[#0052CC] transition">
                    <span className="text-2xl">{m.icon}</span>
                    <h3 className="mt-2 text-sm font-bold text-white">{m.title}</h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== BENEFICIOS ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <h2 className="text-2xl font-black text-white mb-6">Beneficios para la operación</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((b) => (
                  <div key={b.title} className="p-5 rounded-2xl bg-[#1C1E24] border border-[#2E323B]">
                    <div className="w-8 h-8 rounded-lg bg-[#0052CC]/15 border border-[#0052CC]/40 flex items-center justify-center text-[#4C9AFF] text-sm font-bold">
                      ✓
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white">{b.title}</h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== CONTEXTO ACADÉMICO ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1C1E24] border border-[#2E323B] flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-4xl">🎓</div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white">Proyecto académico de prácticas profesionales</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">
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
      <footer id="mas-info" className="border-t border-[#2E323B] bg-[#0B0C0E] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1E24] border border-[#2E323B] flex items-center justify-center p-1.5">
                <Image src="/suth-logo.png" alt="Sutherland Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white">Annotations Platform</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aplicación web de soporte operacional para la estandarización de notas de cumplimiento financiero y riesgo.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Desarrollador</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="text-white font-semibold">Christian Pérez Vega</li>
              <li>
                <a href="tel:+573002003376" className="hover:text-white transition">
                  📞 +57 300 200 3376
                </a>
              </li>
              <li>
                <a href="mailto:chriper18@gmail.com" className="hover:text-white transition">
                  ✉️ chriper18@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Contexto académico</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Proyecto de prácticas profesionales &bull; Ingeniería de Sistemas
              <br />
              Universidad de la Costa (CUC)
              <br />
              Barranquilla, Colombia
            </p>
          </div>
        </div>
        <div className="border-t border-[#2E323B] py-4 text-center text-[11px] text-zinc-500">
          &copy; {new Date().getFullYear()} Christian Pérez Vega &bull; Universidad de la Costa &bull; Barranquilla, Colombia
        </div>
      </footer>

      {/* ================= MODAL DE RECUPERACIÓN DE CONTRASEÑA ================= */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div className="max-w-md w-full bg-[#1C1E24] border border-[#2E323B] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="forgot-password-title"
                  className="text-xl font-extrabold text-white tracking-tight"
                >
                  Recuperar Contraseña
                </h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Valida tu identidad registrada para establecer una nueva contraseña.
                </p>
              </div>
              <button
                type="button"
                disabled={forgotLoading}
                onClick={closeForgotModal}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#121316] border border-transparent hover:border-[#2E323B] transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Indicador visual de pasos */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`px-3 py-2 rounded-lg border font-semibold text-center transition ${
                  forgotStep === 1
                    ? 'bg-[#0052CC]/20 border-[#0065FF] text-[#4C9AFF]'
                    : 'bg-[#121316] border-[#2E323B] text-zinc-400'
                }`}
              >
                1. Validación de Identidad
              </div>
              <div
                className={`px-3 py-2 rounded-lg border font-semibold text-center transition ${
                  forgotStep === 2
                    ? 'bg-[#0052CC]/20 border-[#0065FF] text-[#4C9AFF]'
                    : 'bg-[#121316] border-[#2E323B] text-zinc-500'
                }`}
              >
                2. Nueva Contraseña
              </div>
            </div>

            {forgotError && (
              <div className="bg-[#DE1B54]/10 border border-[#DE1B54]/40 text-[#F43F5E] text-sm p-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="bg-[#0052CC]/15 border border-[#0052CC]/40 text-[#4C9AFF] text-sm p-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleVerifyIdentity} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Correo Corporativo o ID de Empleado:
                  </label>
                  <input
                    type="text"
                    required
                    disabled={forgotLoading}
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError('');
                    }}
                    placeholder="usuario@sutherland.com o cédula"
                    className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Primer Apellido:
                  </label>
                  <input
                    type="text"
                    required
                    disabled={forgotLoading}
                    value={forgotLastName}
                    onChange={(e) => {
                      setForgotLastName(e.target.value);
                      setForgotError('');
                    }}
                    placeholder="Ejm: Perez"
                    className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Fecha de Nacimiento:
                  </label>
                  <input
                    type="date"
                    required
                    disabled={forgotLoading}
                    value={forgotBirthDate}
                    onChange={(e) => {
                      setForgotBirthDate(e.target.value);
                      setForgotError('');
                    }}
                    className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={closeForgotModal}
                    className="px-4 py-2.5 rounded-lg bg-[#121316] hover:bg-[#252830] border border-[#2E323B] text-zinc-300 text-sm font-medium transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200"
                  >
                    {forgotLoading ? 'Verificando...' : 'Verificar Identidad'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="px-3 py-2 rounded-lg bg-[#121316] border border-[#2E323B] text-xs text-zinc-300 flex items-center justify-between gap-2">
                  <span className="truncate">
                    Cuenta:{' '}
                    <strong className="text-white">
                      {forgotEmail.trim().toLowerCase()}
                    </strong>
                  </span>
                  {!forgotCompleted && (
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={() => {
                        setForgotStep(1);
                        setForgotError('');
                        setForgotSuccess('');
                        setForgotNewPassword('');
                        setForgotConfirmPassword('');
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
                    disabled={forgotLoading || forgotCompleted}
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      setForgotError('');
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
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
                    disabled={forgotLoading || forgotCompleted}
                    value={forgotConfirmPassword}
                    onChange={(e) => {
                      setForgotConfirmPassword(e.target.value);
                      setForgotError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#121316] border border-[#2E323B] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0065FF] disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={closeForgotModal}
                    className="px-4 py-2.5 rounded-lg bg-[#121316] hover:bg-[#252830] border border-[#2E323B] text-zinc-300 text-sm font-medium transition disabled:opacity-50"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotCompleted}
                    className="flex-1 py-2.5 px-4 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#003D99] disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200"
                  >
                    {forgotLoading
                      ? 'Guardando...'
                      : forgotCompleted
                        ? 'Contraseña Actualizada'
                        : 'Guardar Nueva Contraseña'}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-[#2E323B] text-center">
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-400 hover:text-[#4C9AFF] transition-colors"
              >
                Abrir recuperación en página dedicada
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

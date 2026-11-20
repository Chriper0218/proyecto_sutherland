import React from 'react';

interface GuideRule {
  step: number;
  title: string;
  description: string;
  badge: string;
  highlight?: boolean;
}

const REGISTRATION_RULES: GuideRule[] = [
  {
    step: 1,
    title: 'Primer nombre y primer apellido',
    badge: 'Obligatorio',
    description:
      'Ingresa únicamente tu primer nombre y primer apellido reales (sin caracteres especiales). Se guardarán normalizados en minúsculas.',
  },
  {
    step: 2,
    title: 'Fecha de nacimiento exacta',
    badge: 'Recuperación',
    description:
      'Registra tu fecha de nacimiento exacta (debes ser mayor de 18 años). Se utilizará para validar tu identidad al recuperar tu contraseña.',
  },
  {
    step: 3,
    title: 'Número de cédula',
    badge: 'ID Único',
    description:
      'Ingresa tu número de documento de identidad sin puntos, espacios ni guiones (entre 4 y 25 caracteres alfanuméricos).',
  },
  {
    step: 4,
    title: 'Correo corporativo @sutherland.com',
    badge: '@sutherland.com',
    description:
      'Campo obligatorio. Tu correo debe terminar estrictamente en @sutherland.com para poder completar el registro.',
  },
  {
    step: 5,
    title: 'Llave de administrador (Opcional)',
    badge: 'Solo Admins',
    highlight: true,
    description:
      'Uso exclusivo para administradores con llave autorizada. Si eres empleado o agente operativo, debes dejar este campo completamente vacío.',
  },
];

export default function RegistrationGuideCard() {
  return (
    <aside
      aria-label="Guía y reglas de registro"
      className="w-full bg-[#1C1E24] border border-[#2E323B] rounded-xl p-6 sm:p-8 shadow-md space-y-6"
    >
      <div className="space-y-2 border-b border-[#2E323B] pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0052CC]/15 text-[#4C9AFF] border border-[#0052CC]/40">
          Paso a Paso
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Guía / Reglas de Registro
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verifica cada requisito antes de crear tu cuenta para evitar rechazos de validación y asegurar la recuperación futura de tu acceso.
        </p>
      </div>

      <ol className="space-y-4">
        {REGISTRATION_RULES.map((rule) => (
          <li
            key={rule.step}
            className={`p-4 rounded-xl border transition ${
              rule.highlight
                ? 'bg-[#DE1B54]/10 border-[#DE1B54]/35'
                : 'bg-[#121316] border-[#2E323B]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono border ${
                  rule.highlight
                    ? 'bg-[#DE1B54]/20 border-[#DE1B54]/50 text-[#F43F5E]'
                    : 'bg-[#0052CC]/20 border-[#0065FF]/40 text-[#4C9AFF]'
                }`}
              >
                {rule.step}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      rule.highlight
                        ? 'bg-[#DE1B54]/15 border-[#DE1B54]/40 text-[#F43F5E]'
                        : 'bg-[#1C1E24] border-[#2E323B] text-zinc-300'
                    }`}
                  >
                    {rule.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{rule.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

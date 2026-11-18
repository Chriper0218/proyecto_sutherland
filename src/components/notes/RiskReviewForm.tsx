import React from 'react';
import { RiskReviewFormData } from './types';
import { COUNTRIES_LIST } from './constants';

interface RiskReviewFormProps {
  form: RiskReviewFormData;
  setForm: React.Dispatch<React.SetStateAction<RiskReviewFormData>>;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  successMessage: string | null;
  isTaskActive?: boolean;
}

export const RiskReviewForm: React.FC<RiskReviewFormProps> = ({
  form,
  setForm,
  onSubmit,
  onReset,
  submitting,
  successMessage,
  isTaskActive = false,
}) => {
  return (
    <div className="bg-[#1C1E24] border border-[#2E323B] rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-[#2E323B] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#0052CC] flex items-center justify-center text-xs font-mono font-bold text-white">
              RR
            </span>
            Formulario: Risk Review (Fraud Review)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Evaluación integral de riesgo de fraude, atributos digitales, dispositivos y cuentas vinculadas.
          </p>
        </div>

        {/* Enlace Botón External Source */}
        <a
          href="https://www.edisontd.nl/country-browser/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-[#121316] hover:bg-[#252830] text-[#4C9AFF] hover:text-[#4C9AFF] border border-[#2E323B] text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4 text-[#4C9AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>EdisonTD Browser</span>
        </a>
      </div>

      <div className="space-y-4">
        {/* 1. Corridor & KYC Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Corridor:
            </label>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setForm({ ...form, corridor: form.corridor ? `${form.corridor} / ${e.target.value}` : e.target.value });
                  }
                }}
                className="w-1/2 bg-[#121316] border border-[#2E323B] rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">País sugerido...</option>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={form.corridor}
                onChange={(e) => setForm({ ...form, corridor: e.target.value })}
                placeholder="Ej: USA -> COL o Domestic"
                className="w-1/2 bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              KYC Status:
            </label>
            <select
              value={form.kycStatus}
              onChange={(e) => setForm({ ...form, kycStatus: e.target.value })}
              className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0065FF]"
            >
              <option value="Verified">Verified</option>
              <option value="Not verified">Not verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Datos del Cliente: Nombre & DOB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Customer&apos;s Name:
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Nombre completo del cliente"
              className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Customer&apos;s DOB:
            </label>
            <input
              type="text"
              value={form.customerDob}
              onChange={(e) => setForm({ ...form, customerDob: e.target.value })}
              placeholder="Fecha de nacimiento (Ej: 1990-05-14)"
              className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* 📌 Attributes are electronically verified */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Attributes are electronically verified
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Phone to name */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-1">
              <span className="text-zinc-300 font-medium block">Phone to name:</span>
              <select
                value={form.phoneToName}
                onChange={(e) => setForm({ ...form, phoneToName: e.target.value as 'match' | 'not match' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar --</option>
                <option value="match">match</option>
                <option value="not match">not match</option>
              </select>
            </div>

            {/* Email to name */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-1">
              <span className="text-zinc-300 font-medium block">Email to name:</span>
              <select
                value={form.emailToName}
                onChange={(e) => setForm({ ...form, emailToName: e.target.value as 'match' | 'not match' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar --</option>
                <option value="match">match</option>
                <option value="not match">not match</option>
              </select>
            </div>

            {/* Mobile number is SMS verified */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-1">
              <span className="text-zinc-300 font-medium block">Mobile is SMS verified:</span>
              <select
                value={form.mobileSmsVerified}
                onChange={(e) => setForm({ ...form, mobileSmsVerified: e.target.value as 'verified' | 'not verified' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar --</option>
                <option value="verified">verified</option>
                <option value="not verified">not verified</option>
              </select>
            </div>

            {/* Email */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-1">
              <span className="text-zinc-300 font-medium block">Email:</span>
              <select
                value={form.emailValid}
                onChange={(e) => setForm({ ...form, emailValid: e.target.value as 'valid' | 'not valid' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar --</option>
                <option value="valid">valid</option>
                <option value="not valid">not valid</option>
              </select>
            </div>

            {/* SSN */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-zinc-300 font-medium block">SSN:</span>
              <select
                value={form.ssnVerified}
                onChange={(e) => setForm({ ...form, ssnVerified: e.target.value as 'verified' | 'not verified' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar --</option>
                <option value="verified">verified</option>
                <option value="not verified">not verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📌 Findings */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Findings
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Emails first seen:</label>
              <input
                type="text"
                value={form.emailsFirstSeen}
                onChange={(e) => setForm({ ...form, emailsFirstSeen: e.target.value })}
                placeholder="Ej: 2023-01-15 o 3 years ago"
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Sign up:</label>
              <input
                type="text"
                value={form.signUp}
                onChange={(e) => setForm({ ...form, signUp: e.target.value })}
                placeholder="Ej: 2024-02-10 / Web portal"
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email derives cx name:</label>
              <select
                value={form.emailDerivesCxName}
                onChange={(e) => setForm({ ...form, emailDerivesCxName: e.target.value as 'yes' | 'not' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar (yes/not) --</option>
                <option value="yes">yes</option>
                <option value="not">not</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Recent change on the account:</label>
              <select
                value={form.recentChangeOnAccount}
                onChange={(e) => setForm({ ...form, recentChangeOnAccount: e.target.value as 'yes' | 'not' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar (yes/not) --</option>
                <option value="yes">yes (habilitar detalle)</option>
                <option value="not">not</option>
              </select>
            </div>

            {form.recentChangeOnAccount === 'yes' && (
              <div className="sm:col-span-2 animate-fadeIn">
                <label className="block text-[#4C9AFF] font-medium mb-1">Detalle del cambio reciente:</label>
                <input
                  type="text"
                  value={form.recentChangeDetails}
                  onChange={(e) => setForm({ ...form, recentChangeDetails: e.target.value })}
                  placeholder="Indica qué cambió (Ej: Phone number updated 2 days ago, new address added)"
                  className="w-full bg-[#121316] border border-[#0052CC]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
                />
              </div>
            )}
          </div>
        </div>

        {/* 📌 Payment Profile information */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Payment Profile information
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-zinc-300">Payment Profile under customer name:</span>
            <select
              value={form.paymentProfileUnderCustomerName}
              onChange={(e) => setForm({ ...form, paymentProfileUnderCustomerName: e.target.value as 'yes' | 'not' })}
              className="w-full sm:w-48 bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
            >
              <option value="">-- Seleccionar --</option>
              <option value="yes">yes</option>
              <option value="not">not</option>
            </select>
          </div>
        </div>

        {/* 📌 RISK SUMMARY on account reviewed */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 RISK SUMMARY on account reviewed
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                - Same device (indicar si hay varios dispositivos o solo 1):
              </label>
              <input
                type="text"
                value={form.sameDevice}
                onChange={(e) => setForm({ ...form, sameDevice: e.target.value })}
                placeholder="Ej: 1 device registered / 2 devices detected (iPhone iOS 17 + Android)"
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                - Customer connection details (sending corridor, connection type):
              </label>
              <input
                type="text"
                value={form.cellularConnection}
                onChange={(e) => setForm({ ...form, cellularConnection: e.target.value })}
                placeholder="Customer is logged in sending corridor, through a cellular connection"
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              />
            </div>
          </div>
        </div>

        {/* 📌 Linked accounts */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Linked accounts
          </span>

          <div className="space-y-3 text-xs">
            {/* Duplicate */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">▷ Duplicate:</span>
                <select
                  value={form.duplicateAccount}
                  onChange={(e) => setForm({ ...form, duplicateAccount: e.target.value as 'not' | 'yes' })}
                  className="bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0065FF]"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="not">not</option>
                  <option value="yes">yes</option>
                </select>
              </div>
              {(form.duplicateAccount === 'yes' || form.duplicateAccount === 'not') && (
                <input
                  type="text"
                  value={form.duplicateAccountDetails}
                  onChange={(e) => setForm({ ...form, duplicateAccountDetails: e.target.value })}
                  placeholder="Pegar correo o link de la cuenta duplicada (opcional si es limpia)..."
                  className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
                />
              )}
            </div>

            {/* Suspended */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">▷ Suspended:</span>
                <select
                  value={form.suspendedAccount}
                  onChange={(e) => setForm({ ...form, suspendedAccount: e.target.value as 'not' | 'yes' })}
                  className="bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0065FF]"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="not">not</option>
                  <option value="yes">yes</option>
                </select>
              </div>
              {(form.suspendedAccount === 'yes' || form.suspendedAccount === 'not') && (
                <input
                  type="text"
                  value={form.suspendedAccountDetails}
                  onChange={(e) => setForm({ ...form, suspendedAccountDetails: e.target.value })}
                  placeholder="Pegar correo o link de la cuenta suspendida..."
                  className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
                />
              )}
            </div>

            {/* High-Risk */}
            <div className="p-2.5 rounded-lg bg-[#1C1E24] border border-[#2E323B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">▷ High-Risk:</span>
                <select
                  value={form.highRiskAccount}
                  onChange={(e) => setForm({ ...form, highRiskAccount: e.target.value as 'not' | 'yes' })}
                  className="bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0065FF]"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="not">not</option>
                  <option value="yes">yes</option>
                </select>
              </div>
              {(form.highRiskAccount === 'yes' || form.highRiskAccount === 'not') && (
                <input
                  type="text"
                  value={form.highRiskAccountDetails}
                  onChange={(e) => setForm({ ...form, highRiskAccountDetails: e.target.value })}
                  placeholder="Pegar correo o link de la cuenta high-risk..."
                  className="w-full bg-[#121316] border border-[#2E323B] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* 📌 Sending patterns */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Sending patterns
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Transfer History:</label>
              <textarea
                rows={2}
                value={form.transferHistory}
                onChange={(e) => setForm({ ...form, transferHistory: e.target.value })}
                placeholder="Detalles sobre transacciones previas, montos o frecuencia..."
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Frequency:</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as 'high' | 'medium' | 'low' })}
                className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF]"
              >
                <option value="">-- Seleccionar frecuencia --</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📌 Doc review */}
        <div className="p-4 bg-[#121316] rounded-xl border border-[#2E323B] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4C9AFF] block">
            📌 Doc review
          </span>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Enlace / Link del ID:
            </label>
            <input
              type="url"
              value={form.docReviewLink}
              onChange={(e) => setForm({ ...form, docReviewLink: e.target.value })}
              placeholder="https://... (URL al ID del cliente)"
              className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Is Photo Visible */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">Is Photo Visible:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isPhotoVisible === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isPhotoVisible === 'No' ? 'bg-rose-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is Id Number Visible */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">Is Id Number Visible:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isIdNumberVisible === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isIdNumberVisible === 'No' ? 'bg-rose-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is it expired */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">Is it expired:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isExpired === 'Yes' ? 'bg-rose-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isExpired === 'No' ? 'bg-emerald-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Dob Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">Dob Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isDobMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isDobMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Name Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">Name Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isNameMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isNameMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-[#252830] text-zinc-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* External Link Found */}
            <div className="flex items-center justify-between p-2 rounded bg-[#1C1E24] border border-[#2E323B]">
              <span className="text-zinc-300">External Link Found:</span>
              <a
                href="https://www.edisontd.nl/country-browser/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] px-2 py-0.5 rounded bg-[#0052CC]/15 text-[#4C9AFF] hover:bg-[#0052CC]/25 transition font-medium"
              >
                EdisonTD ↗
              </a>
            </div>
          </div>
        </div>

        {/* ✔️ Actions taken */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            ✔️ Actions taken:
          </label>
          <textarea
            rows={3}
            value={form.actionsTaken}
            onChange={(e) => setForm({ ...form, actionsTaken: e.target.value })}
            placeholder="Describe las acciones tomadas en la cuenta (Ej: Account restricted, fraud hold applied, CX contacted via email, transaction cancelled...)"
            className="w-full bg-[#121316] border border-[#2E323B] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0065FF] placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#0052CC] hover:bg-[#0065FF] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-sm transition flex items-center justify-center gap-2 disabled:bg-[#003D99] disabled:cursor-not-allowed"
        >
          {submitting ? (
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
          onClick={onReset}
          disabled={isTaskActive}
          className={`w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
            isTaskActive
              ? 'bg-[#121316] text-zinc-500 border-[#2E323B] cursor-not-allowed opacity-60'
              : 'bg-[#121316] hover:bg-[#252830] text-zinc-200 border-[#2E323B] hover:border-[#0065FF] cursor-pointer shadow-sm'
          }`}
          title={
            isTaskActive
              ? '🔒 Debes presionar "Generar Nota y Detener AHT" antes de iniciar una nueva tarea'
              : 'Iniciar una nueva tarea limpia de Risk Review'
          }
        >
          {isTaskActive ? (
            <>
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Nueva Tarea (Bloqueado)</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-[#4C9AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Iniciar Nueva Tarea Risk Review</span>
            </>
          )}
        </button>
      </div>

      {/* Mensaje de Confirmación al Generar */}
      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-medium text-emerald-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

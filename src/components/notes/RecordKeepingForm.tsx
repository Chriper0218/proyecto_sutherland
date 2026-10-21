import React from 'react';
import { RecordKeepingFormData } from './types';
import { COUNTRIES_LIST } from './constants';

interface RecordKeepingFormProps {
  form: RecordKeepingFormData;
  setForm: React.Dispatch<React.SetStateAction<RecordKeepingFormData>>;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  successMessage: string | null;
  isTaskActive?: boolean;
}

export const RecordKeepingForm: React.FC<RecordKeepingFormProps> = ({
  form,
  setForm,
  onSubmit,
  onReset,
  submitting,
  successMessage,
  isTaskActive = false,
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-xs font-mono font-bold text-white">
              RK
            </span>
            Formulario: Record Keeping Review
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Validación de archivo documental, prueba de identidad, comprobante de domicilio y preguntas de debida diligencia.
          </p>
        </div>

        {/* Enlace Botón External Source */}
        <a
          href="https://www.edisontd.nl/country-browser/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>EdisonTD Browser</span>
        </a>
      </div>

      <div className="space-y-4">
        {/* País & Work Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              País Emisor (COUNTRIES_LIST):
            </label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">-- Selecciona el País --</option>
              {COUNTRIES_LIST.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ✔️ Work Type:
            </label>
            <input
              type="text"
              readOnly
              value={form.workType}
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {/* KYC Status & Duplicate Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ✔️ KYC status:
            </label>
            <select
              value={form.kycStatus}
              onChange={(e) => setForm({ ...form, kycStatus: e.target.value as 'Verified' | 'Not verified' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Verified">Verified</option>
              <option value="Not verified">Not verified</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ✔️ Duplicate Accounts:
            </label>
            <select
              value={form.duplicateAccounts}
              onChange={(e) => setForm({ ...form, duplicateAccounts: e.target.value as 'yes' | 'not' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">-- Seleccionar (yes / not) --</option>
              <option value="not">not</option>
              <option value="yes">yes (habilitar correo o enlace)</option>
            </select>
          </div>

          {form.duplicateAccounts === 'yes' && (
            <div className="sm:col-span-2 animate-fadeIn">
              <label className="block text-teal-300 font-medium mb-1 text-xs">
                Correo o enlace de la cuenta duplicada:
              </label>
              <input
                type="text"
                value={form.duplicateAccountsDetails}
                onChange={(e) => setForm({ ...form, duplicateAccountsDetails: e.target.value })}
                placeholder="Pegar el correo o enlace de la cuenta duplicada detectada"
                className="w-full bg-slate-900 border border-teal-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 placeholder:text-slate-500"
              />
            </div>
          )}
        </div>

        {/* 📝 Doc Review: Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            📝 Doc Review (Enlace / URL de los documentos de identidad):
          </label>
          <input
            type="url"
            value={form.docReviewLink}
            onChange={(e) => setForm({ ...form, docReviewLink: e.target.value })}
            placeholder="https://... (URL al documento o expediente del cliente)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
          />
        </div>

        {/* 🧍 Proof of Identity */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block flex items-center gap-1.5">
            <span>🧍</span> Proof of Identity
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Is Photo Visible */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Is Photo Visible:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isPhotoVisible === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isPhotoVisible === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is Id Number Visible */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Is Id Number Visible:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isIdNumberVisible === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isIdNumberVisible === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is it expired */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Is it expired:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isExpired === 'Yes' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isExpired === 'No' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Dob Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Dob Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isDobMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isDobMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Name Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Name Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'Yes' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isNameMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'No' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    form.isNameMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* External Link Found */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">External Link Found:</span>
              <a
                href="https://www.edisontd.nl/country-browser/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition font-medium"
              >
                EdisonTD ↗
              </a>
            </div>
          </div>
        </div>

        {/* 🏠 Proof of address */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block flex items-center gap-1.5">
            <span>🏠</span> Proof of address (POA)
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enlace / URL del Comprobante de Domicilio:
            </label>
            <input
              type="url"
              value={form.poaDocLink}
              onChange={(e) => setForm({ ...form, poaDocLink: e.target.value })}
              placeholder="https://... (URL al comprobante de domicilio / recibo de servicios)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Is POA expired or older than Ninety Days */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700 sm:col-span-2">
              <span className="text-slate-300">Is POA expired or older than Ninety Days:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaExpiredOrOlder90Days: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaExpiredOrOlder90Days === 'Yes' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaExpiredOrOlder90Days: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaExpiredOrOlder90Days === 'No' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Address Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Address Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaAddressMatch: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaAddressMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaAddressMatch: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaAddressMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Name Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-slate-300">Name Matches Customer Record:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaNameMatch: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaNameMatch === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPoaNameMatch: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    form.isPoaNameMatch === 'No' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✔️ Mandatory questions for record keeping */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
            ✔️ Mandatory questions for record keeping
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ▷ What is your current occupation?:
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                placeholder="Ej: Software Engineer, Merchant, Consultant..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ▷ Who is your employer?:
              </label>
              <input
                type="text"
                value={form.employer}
                onChange={(e) => setForm({ ...form, employer: e.target.value })}
                placeholder="Nombre de la empresa o Self-employed"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ▷ Where do the funds it will use to operate come from?:
              </label>
              <input
                type="text"
                value={form.fundsSource}
                onChange={(e) => setForm({ ...form, fundsSource: e.target.value })}
                placeholder="Ej: Salary / Savings / Business profits"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* PEP */}
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-300">
                  ▷ Are you, a member of management, or a beneficial owner a PEP?:
                </span>
                <select
                  value={form.isPep}
                  onChange={(e) => setForm({ ...form, isPep: e.target.value as 'yes' | 'not' })}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="not">not</option>
                  <option value="yes">yes</option>
                </select>
              </div>
              {form.isPep === 'yes' && (
                <input
                  type="text"
                  value={form.pepDetails}
                  onChange={(e) => setForm({ ...form, pepDetails: e.target.value })}
                  placeholder="Detalles sobre el cargo o rol PEP..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              )}
            </div>

            {/* Foreign currency or accounts */}
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-300">
                  ▷ Do you conduct transactions in foreign currency or have accounts outside the country?:
                </span>
                <select
                  value={form.foreignTransactions}
                  onChange={(e) => setForm({ ...form, foreignTransactions: e.target.value as 'yes' | 'not' })}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="not">not</option>
                  <option value="yes">yes</option>
                </select>
              </div>
              {form.foreignTransactions === 'yes' && (
                <input
                  type="text"
                  value={form.foreignTransactionsDetails}
                  onChange={(e) => setForm({ ...form, foreignTransactionsDetails: e.target.value })}
                  placeholder="Detalles de monedas extranjeras o cuentas en el exterior..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* Record Keeping Decision (Aprobado / Denegado) */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                ✔️ Decisión de Record Keeping
              </span>
              <span className="text-[11px] text-slate-400">
                Aprobado o denegado (si es denegado, describe el motivo específico)
              </span>
            </div>

            <select
              value={form.recordKeepingDecision}
              onChange={(e) => setForm({ ...form, recordKeepingDecision: e.target.value as 'Approved' | 'Denied' })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Approved">✔️ Approved</option>
              <option value="Denied">❌ Denied</option>
            </select>
          </div>

          {form.recordKeepingDecision === 'Denied' && (
            <div className="animate-fadeIn space-y-1">
              <label className="block text-rose-300 font-semibold text-xs">
                Motivo por el cual fue denegado el Record Keeping:
              </label>
              <textarea
                rows={2}
                value={form.denialReason}
                onChange={(e) => setForm({ ...form, denialReason: e.target.value })}
                placeholder="Especifica el motivo de denegación (Ej: Documento POA expirado con más de 90 días, discrepancia de domicilio, falta de respuesta...)"
                className="w-full bg-slate-900 border border-rose-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 placeholder:text-slate-500"
              />
            </div>
          )}
        </div>

        {/* ✔️ Actions Taken */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            ✔️ Actions Taken:
          </label>
          <textarea
            rows={3}
            value={form.actionsTaken}
            onChange={(e) => setForm({ ...form, actionsTaken: e.target.value })}
            placeholder="Describe las acciones tomadas en la cuenta..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:bg-teal-800 disabled:cursor-not-allowed"
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
              ? 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-md'
          }`}
          title={
            isTaskActive
              ? '🔒 Debes presionar "Generar Nota y Detener AHT" antes de iniciar una nueva tarea'
              : 'Iniciar una nueva tarea limpia de Record Keeping'
          }
        >
          {isTaskActive ? (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Nueva Tarea (Bloqueado)</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Iniciar Nueva Tarea RK</span>
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

import React from 'react';
import { WatchlistReviewFormData } from './types';
import { COUNTRIES_LIST } from './constants';

interface WatchlistReviewFormProps {
  form: WatchlistReviewFormData;
  setForm: React.Dispatch<React.SetStateAction<WatchlistReviewFormData>>;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  successMessage: string | null;
}

export const WatchlistReviewForm: React.FC<WatchlistReviewFormProps> = ({
  form,
  setForm,
  onSubmit,
  onReset,
  submitting,
  successMessage,
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-xs font-mono font-bold text-white">
              WL
            </span>
            Formulario: Watchlist Review ({form.matchType})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparación de listas de sanciones y PEP contra documento primario ({form.matchType}).
          </p>
        </div>

        {/* Enlace Botón External Source */}
        <a
          href="https://www.edisontd.nl/country-browser/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-purple-400 hover:text-purple-300 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>EdisonTD Browser</span>
        </a>
      </div>

      <div className="space-y-4">
        {/* Corridor & Match Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ▷ Corridor:
            </label>
            <select
              value={form.corridorCountry}
              onChange={(e) => setForm({ ...form, corridorCountry: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Selecciona el País (COUNTRIES_LIST) --</option>
              {COUNTRIES_LIST.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ▷ Match (Sender o Recipient):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, matchType: 'Sender' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  form.matchType === 'Sender'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>👤 Sender</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, matchType: 'Recipient' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  form.matchType === 'Recipient'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>🎯 Recipient</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📌 • Findings • */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            📌 • Findings •
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ▷ {form.matchType} ID (Enlace o link al documento):
              </label>
              <input
                type="url"
                value={form.idLink}
                onChange={(e) => setForm({ ...form, idLink: e.target.value })}
                placeholder={`https://... (URL al documento de identidad del ${form.matchType.toLowerCase()})`}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300">▷ External source:</span>
              <a
                href={form.externalSource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 underline font-mono text-[11px] flex items-center gap-1"
              >
                <span>https://www.edisontd.nl/country-browser/</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 📌 ID Details */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            📌 ID Details ({form.matchType})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ Full Name on ID:</label>
              <input
                type="text"
                value={form.idFullName}
                onChange={(e) => setForm({ ...form, idFullName: e.target.value })}
                placeholder="Nombre completo visible en el ID"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ Date of birth on ID:</label>
              <input
                type="text"
                value={form.idDob}
                onChange={(e) => setForm({ ...form, idDob: e.target.value })}
                placeholder="Fecha de nacimiento en el ID (Ej: 1985-08-22)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ ID number:</label>
              <input
                type="text"
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                placeholder="Número de documento de identidad"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ Expiration date:</label>
              <input
                type="text"
                value={form.idExpirationDate}
                onChange={(e) => setForm({ ...form, idExpirationDate: e.target.value })}
                placeholder="Fecha de vencimiento (Ej: 2028-11-30)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Checkbox de ID Expirado */}
            <div className="sm:col-span-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isIdExpired}
                  onChange={(e) => setForm({ ...form, isIdExpired: e.target.checked })}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900"
                />
                <span className="font-semibold">¿El ID se encuentra vencido/expirado?</span>
              </label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${form.isIdExpired ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {form.isIdExpired ? '⚠️ Expirado' : '✔️ Vigente'}
              </span>
            </div>

            {form.isIdExpired && (
              <div className="sm:col-span-2 p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300 animate-fadeIn flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Regla de Compliance:</strong> Si el ID está expirado, NO se puede usar para limpiar el match de Watchlist.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 📌 Match Details */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            📌 Match Details (Información de la lista sancionada / PEP)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">▷ Full Name of the match and AKA:</label>
              <input
                type="text"
                value={form.matchFullNameAka}
                onChange={(e) => setForm({ ...form, matchFullNameAka: e.target.value })}
                placeholder="Nombre exacto del match sancionado y alias (AKA)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ Date of birth of the match:</label>
              <input
                type="text"
                value={form.matchDob}
                onChange={(e) => setForm({ ...form, matchDob: e.target.value })}
                placeholder="DOB en la lista (Ej: 1974-03-12)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">▷ Location of the match:</label>
              <input
                type="text"
                value={form.matchLocation}
                onChange={(e) => setForm({ ...form, matchLocation: e.target.value })}
                placeholder="Ubicación / país del match sancionado"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 📌 Resolution: How Cleared */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            📌 Resolution
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                How: Cleared by [attribute used]:
              </label>
              <select
                value={form.attributeUsed}
                onChange={(e) => setForm({ ...form, attributeUsed: e.target.value as 'Name' | 'DOB' | 'Location' })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500"
              >
                <option value="Name">Name (Nombre)</option>
                <option value="DOB">DOB (Fecha de nacimiento)</option>
                <option value="Location">Location (Ubicación / Nacionalidad)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {form.matchType} attribute used to clear: [ {form.attributeUsed} ]
                </label>
                <input
                  type="text"
                  value={form.clearingAttributeValue}
                  onChange={(e) => setForm({ ...form, clearingAttributeValue: e.target.value })}
                  placeholder={`Valor del ${form.matchType} (${form.attributeUsed})`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Match attribute used: [ Sanctioned {form.attributeUsed} ]
                </label>
                <input
                  type="text"
                  value={form.matchAttributeValue}
                  onChange={(e) => setForm({ ...form, matchAttributeValue: e.target.value })}
                  placeholder={`Valor del match sancionado (${form.attributeUsed})`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 📌 CONCLUSION & RESOLUTION */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            📌 CONCLUSION & RESOLUTION
          </span>

          <div className="space-y-3 text-xs">
            {/* Opción 1: FALSE POSITIVE */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                form.conclusion === 'FALSE_POSITIVE'
                  ? 'bg-purple-950/40 border-purple-500/80 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input
                type="radio"
                name="watchlist_conclusion"
                checked={form.conclusion === 'FALSE_POSITIVE'}
                onChange={() => setForm({ ...form, conclusion: 'FALSE_POSITIVE' })}
                className="mt-0.5 text-purple-600 focus:ring-purple-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-purple-300 block">
                  [X] FALSE POSITIVE
                </span>
                <p className="text-[11px] text-slate-300">
                  The match is confirmed as a false positive due to a non-matching unique identifier (ID/DOB/Location).
                </p>
              </div>
            </label>

            {/* Opción 2: TRUE POSITIVE */}
            <div
              className={`p-3 rounded-xl border transition space-y-2 ${
                form.conclusion === 'TRUE_POSITIVE'
                  ? 'bg-rose-950/30 border-rose-500/80 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="watchlist_conclusion"
                  checked={form.conclusion === 'TRUE_POSITIVE'}
                  onChange={() => setForm({ ...form, conclusion: 'TRUE_POSITIVE' })}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-rose-300 block">
                    [ ] TRUE POSITIVE - DISPOSITION:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Match confirmado como positivo. Selecciona la disposición correspondiente:
                  </p>
                </div>
              </label>

              {form.conclusion === 'TRUE_POSITIVE' && (
                <div className="pt-2 pl-7 animate-fadeIn">
                  <select
                    value={form.truePositiveDisposition}
                    onChange={(e) => setForm({ ...form, truePositiveDisposition: e.target.value })}
                    className="w-full bg-slate-900 border border-rose-500/50 rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 focus:outline-none focus:border-rose-400"
                  >
                    <option value="Escalated to MLRO">Escalated to MLRO</option>
                    <option value="Frozen Funds">Frozen Funds</option>
                    <option value="Blocked Account">Blocked Account</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 disabled:bg-purple-800 disabled:cursor-not-allowed"
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
          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-700/60 hover:bg-amber-600/20 hover:text-amber-300 text-slate-300 text-xs font-semibold border border-slate-600 hover:border-amber-500/40 transition flex items-center justify-center gap-1.5"
          title="Reiniciar y registrar la tarea previa para medir eficiencia"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Nueva Tarea (Registrar Vacío)</span>
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

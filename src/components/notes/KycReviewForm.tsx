import React from 'react';
import { KycFormData } from './types';
import { COUNTRIES_LIST, PRIMARY_DOCUMENT_TYPES } from './constants';

interface KycReviewFormProps {
  form: KycFormData;
  setForm: React.Dispatch<React.SetStateAction<KycFormData>>;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  successMessage: string | null;
  isTaskActive?: boolean;
}

export const KycReviewForm: React.FC<KycReviewFormProps> = ({
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
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-xs font-mono font-bold">
              ID
            </span>
            Formulario KYC: Proof of Identity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Completa las validaciones del documento primario para estandarizar la auditoría.
          </p>
        </div>

        {/* Enlace Botón External Source */}
        <a
          href="https://www.edisontd.nl/country-browser/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>EdisonTD Browser</span>
        </a>
      </div>

      {/* Campos Principales */}
      <div className="space-y-4">
        {/* 1. País & 2. Corridor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              1. País Emisor del Documento:
            </label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
              2. Corridor:
            </label>
            <input
              type="text"
              value={form.corridor}
              onChange={(e) => setForm({ ...form, corridor: e.target.value })}
              placeholder="Ej: USA -> COL o Domestic US"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* 3. Reviewed Document (Primary ID Type) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            3. Reviewed Document (Primary ID Type):
          </label>
          <div className="space-y-2">
            <select
              value={form.reviewedDocument}
              onChange={(e) => setForm({ ...form, reviewedDocument: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Selecciona el tipo de documento primario --</option>
              {PRIMARY_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {form.reviewedDocument === 'Otro Documento Primario' && (
              <input
                type="text"
                value={form.customDocument}
                onChange={(e) => setForm({ ...form, customDocument: e.target.value })}
                placeholder="Especifica el documento primario (Ej: Cédula de Extranjería)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            )}
          </div>
        </div>

        {/* 4. Enlace / URL del Documento ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            4. Enlace / URL del Documento ID:
          </label>
          <input
            type="url"
            value={form.docLink}
            onChange={(e) => setForm({ ...form, docLink: e.target.value })}
            placeholder="https://... (URL al documento o archivo que estás manejando)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* 5. Validaciones de Seguridad del ID */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            5. Validaciones de Seguridad del ID
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Is Photo Visible */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300">Is Photo Visible?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isPhotoVisible === 'Yes'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPhotoVisible: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isPhotoVisible === 'No'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is Id Number Visible */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300">Is Id Number Visible?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isIdNumberVisible === 'Yes'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isIdNumberVisible: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isIdNumberVisible === 'No'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Is it expired */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300">Is it expired?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isExpired === 'Yes'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpired: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isExpired === 'No'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* DOB Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300">DOB Matches Customer Record?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isDobMatch === 'Yes'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isDobMatch: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isDobMatch === 'No'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Name Matches Customer Record */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700 sm:col-span-2">
              <span className="text-slate-300">Name Matches Customer Record?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'Yes' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isNameMatch === 'Yes'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isNameMatch: 'No' })}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    form.isNameMatch === 'No'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            6. Observations:
          </label>
          <textarea
            rows={2}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            placeholder="Detalles adicionales sobre nitidez del documento, elementos de seguridad, etc."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* 7. Review Decision */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              7. Review Decision:
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, reviewDecision: 'KYC review approved' })}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition font-medium"
              >
                ✔️ Approved
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, reviewDecision: 'KYC review denied due to ' })}
                className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition font-medium"
              >
                ❌ Denied
              </button>
            </div>
          </div>

          <input
            type="text"
            value={form.reviewDecision}
            onChange={(e) => setForm({ ...form, reviewDecision: e.target.value })}
            placeholder="KYC review approved"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 font-mono"
          />
        </div>

        {/* 8. Next agent actions */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            8. Next agent actions:
          </label>
          <textarea
            rows={2}
            value={form.nextActions}
            onChange={(e) => setForm({ ...form, nextActions: e.target.value })}
            placeholder="Ej: Proceder con la liberación de la transacción / Solicitar comprobante de domicilio"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:bg-blue-800 disabled:cursor-not-allowed"
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
              : 'Iniciar una nueva tarea limpia de KYC'
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
              <span>+ Iniciar Nueva Tarea KYC</span>
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

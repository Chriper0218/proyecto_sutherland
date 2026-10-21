import React from 'react';

interface NotePreviewCardProps {
  noteText: string;
  templateTitle: string;
  isCopied: boolean;
  onCopy: () => void;
  caseType: string;
}

export const NotePreviewCard: React.FC<NotePreviewCardProps> = ({
  noteText,
  templateTitle,
  isCopied,
  onCopy,
  caseType,
}) => {
  const lineCount = noteText.split('\n').length;
  const charCount = noteText.length;

  return (
    <div className="space-y-3 sticky top-24">
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera del Bloc de Notas */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-xs font-mono font-medium text-slate-300 ml-2">
              Nota Generada: {templateTitle}
            </span>
          </div>

          {/* Botón de Copiado Inteligente */}
          <button
            type="button"
            onClick={onCopy}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 shadow-md ${
              isCopied
                ? 'bg-emerald-600 text-white border border-emerald-400 scale-105'
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 active:scale-95'
            }`}
          >
            {isCopied ? (
              <>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copiar Nota</span>
              </>
            )}
          </button>
        </div>

        {/* Contenido de la Nota Formateada (Texto Exacto) */}
        <div className="p-4 sm:p-5 overflow-x-auto max-h-[70vh] bg-slate-950 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-all">
          <pre className="whitespace-pre-wrap break-words font-mono">
            {noteText}
          </pre>
        </div>

        {/* Pie de bloc de notas */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>{lineCount} líneas &bull; {charCount} caracteres</span>
          <span>{isCopied ? '✓ Copiado al portapapeles' : 'Listo para copiar'}</span>
        </div>
      </div>

      {/* Guía Rápida para el Operador */}
      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1.5">
        <span className="font-semibold text-slate-300 block">Instrucciones Operativas ({caseType}):</span>
        <p>
          1. Completa las validaciones y campos correspondientes del caso en curso.
        </p>
        <p>
          2. Haz clic en <span className="text-blue-400 font-semibold">&ldquo;Generar Nota y Detener AHT&rdquo;</span> para detener el cronómetro y registrar el tiempo exacto en la base de datos.
        </p>
        <p>
          3. Si descartas la tarea con <span className="text-amber-400 font-semibold">&ldquo;Nueva Tarea&rdquo;</span>, el tiempo empleado se registra para auditar tareas incompletas.
        </p>
        <p>
          4. Presiona <span className="text-emerald-400 font-semibold">&ldquo;Copiar Nota&rdquo;</span> y pégala directamente en el sistema de tickets de cumplimiento.
        </p>
        <p className="pt-2 border-t border-slate-700/60 text-[11px] text-amber-300/90 flex items-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            <strong>Política de sesión:</strong> Para cerrar sesión es obligatorio culminar la tarea activa y finalizar tu turno.
          </span>
        </p>
      </div>
    </div>
  );
};

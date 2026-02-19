import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, AlertTriangle, DownloadCloud, XCircle, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  resultChanges: string[];
  error: string | null;
  // New props for confirmation workflow
  onConfirm?: () => void;
  onDiscard?: () => void;
}

const LOADING_STEPS = [
  "Verbinde mit Gemini AI...",
  "Analysiere aktuelle Tarifstrukturen...",
  "Durchsuche Webseiten der Anbieter (DHL, Hermes, DPD, GLS)...",
  "Vergleiche gefundene Preise mit Datenbank...",
  "Finalisiere Update..."
];

export const UpdateStatusModal: React.FC<Props> = ({ 
    isOpen, isLoading, onClose, resultChanges, error, onConfirm, onDiscard 
}) => {
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (isOpen && isLoading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500); // Change text every 1.5s
      return () => clearInterval(interval);
    }
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const hasChanges = resultChanges.length > 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity" 
        // Only allow closing via clicking backdrop if we are NOT in the middle of a decision
        onClick={(!isLoading && !hasChanges) ? onClose : undefined}
      />
      
      <div className="relative bg-stone-200 dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300 border border-stone-300 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-300 dark:border-slate-800 bg-stone-200 dark:bg-slate-850">
          <h2 className="text-lg font-bold text-stone-800 dark:text-white flex items-center gap-2">
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin text-stone-600 dark:text-indigo-400" size={20} />
                    Live Update
                </>
            ) : error ? (
                <>
                    <AlertTriangle className="text-rose-500" size={20} />
                    Fehler
                </>
            ) : hasChanges ? (
                <>
                    <DownloadCloud className="text-stone-600" size={20} />
                    Updates gefunden
                </>
            ) : (
                <>
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    Alles aktuell
                </>
            )}
          </h2>
          {!isLoading && !hasChanges && (
            <button onClick={onClose} className="p-1.5 hover:bg-stone-300 dark:hover:bg-slate-700 rounded-full text-stone-500 dark:text-slate-400 transition-colors">
                <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
            
            {/* LOADING STATE */}
            {isLoading && (
                <div className="space-y-6 text-center py-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-stone-300 dark:border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-stone-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="h-12 flex items-center justify-center">
                        <p className="text-sm font-medium text-stone-600 dark:text-slate-300 animate-pulse transition-all duration-300">
                            {LOADING_STEPS[loadingStep]}
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR STATE */}
            {!isLoading && error && (
                <div className="text-center py-2">
                    <p className="text-stone-700 dark:text-slate-300 mb-4">{error}</p>
                    <button onClick={onClose} className="px-4 py-2 bg-stone-300 dark:bg-slate-800 rounded-lg text-sm font-semibold hover:bg-stone-400 dark:hover:bg-slate-700 transition-colors">
                        Schließen
                    </button>
                </div>
            )}

            {/* RESULT STATE */}
            {!isLoading && !error && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wide">
                            {hasChanges ? `${resultChanges.length} Änderung(en) verfügbar` : 'Keine Änderungen gefunden'}
                        </span>
                    </div>

                    <div className="bg-stone-100 dark:bg-slate-950 rounded-lg border border-stone-300 dark:border-slate-800 p-3 max-h-60 overflow-y-auto scrollbar-thin">
                        {hasChanges ? (
                            <ul className="space-y-2">
                                {resultChanges.map((change, idx) => (
                                    <li key={idx} className="text-sm text-stone-700 dark:text-slate-300 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                        <span className="font-mono text-xs md:text-sm">{change}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-stone-400 dark:text-slate-600">
                                <CheckCircle2 size={32} className="mb-2 opacity-50" />
                                <p className="text-sm">Deine Preise entsprechen den aktuell gefundenen Online-Preisen.</p>
                            </div>
                        )}
                    </div>

                    {hasChanges ? (
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onDiscard}
                                className="flex-1 py-2.5 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-200 rounded-lg font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} /> Verwerfen
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-2.5 bg-stone-800 dark:bg-indigo-500 text-white rounded-lg font-bold shadow-md shadow-stone-400 dark:shadow-none hover:bg-black dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Preise übernehmen
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full mt-2 py-2.5 bg-stone-300 dark:bg-slate-800 text-stone-800 dark:text-slate-300 rounded-lg font-bold hover:bg-stone-400 dark:hover:bg-slate-700 transition-colors"
                        >
                            Fertig
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
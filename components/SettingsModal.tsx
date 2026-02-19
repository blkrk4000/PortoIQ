import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Save, Lock, ExternalLink, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Tariff, ChangeLogEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Data needed for export
  currentTariffs: Tariff[];
  lastUpdated: string | null;
  changeLog: ChangeLogEntry[];
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, currentTariffs, lastUpdated, changeLog }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing key
    const currentKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(currentKey);
  }, [isOpen]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      // We don't close immediately here, user might want to do data stuff
    }, 800);
  };

  // EXPORT FUNCTION
  const handleExport = () => {
    const data = {
      tariffs: currentTariffs,
      lastUpdated: lastUpdated,
      changeLog: changeLog,
      exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `portoiq_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // IMPORT FUNCTION
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic Validation
        if (data.tariffs && Array.isArray(data.tariffs)) {
            if (confirm(`Backup vom ${data.lastUpdated || 'Unbekannt'} importieren? Dies überschreibt die aktuellen Preise.`)) {
                // Save to Local Storage with NEW keys
                localStorage.setItem('portoiq_tariffs', JSON.stringify(data.tariffs));
                if (data.lastUpdated) localStorage.setItem('portoiq_last_updated', data.lastUpdated);
                if (data.changeLog) localStorage.setItem('portoiq_change_log', JSON.stringify(data.changeLog));
                
                // Reload to apply changes cleanly
                window.location.reload();
            }
        } else {
            alert("Fehler: Ungültiges Dateiformat. (Keine Tarife gefunden)");
        }
      } catch (err) {
        console.error(err);
        alert("Fehler beim Lesen der Datei. Ist es eine valide JSON Datei?");
      }
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-stone-200 dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-300 dark:border-slate-800 bg-stone-200 dark:bg-slate-850 flex-shrink-0">
          <h2 className="text-lg font-bold text-stone-800 dark:text-white flex items-center gap-2">
            <Key size={18} className="text-stone-600 dark:text-indigo-400" />
            Einstellungen
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-300 dark:hover:bg-slate-700 rounded-full text-stone-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* API KEY SECTION */}
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lock size={12} /> Google Gemini API Key
            </label>
            <div className="flex gap-2">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 pl-3 pr-4 py-2 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-stone-400/20 dark:focus:ring-indigo-900/30 focus:border-stone-500 dark:focus:border-indigo-400 outline-none transition-all font-mono placeholder:text-stone-400 dark:placeholder:text-slate-600"
                />
                <button
                    onClick={handleSaveKey}
                    className={`px-4 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    saved 
                        ? 'bg-stone-600 text-white dark:bg-emerald-500 shadow-none' 
                        : 'bg-stone-800 dark:bg-indigo-500 text-white hover:bg-black dark:hover:bg-indigo-600'
                    }`}
                >
                    {saved ? <Key size={16} /> : <Save size={16} />}
                </button>
            </div>
            <p className="mt-2 text-[10px] text-stone-400 dark:text-slate-500">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="hover:underline inline-flex items-center gap-0.5"
              >
                Key hier erstellen <ExternalLink size={10} />
              </a>
            </p>
          </div>

          <div className="border-t border-stone-300 dark:border-slate-800"></div>

          {/* DATA MANAGEMENT SECTION */}
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database size={12} /> Datenverwaltung
            </label>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-100 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-stone-400 dark:hover:border-indigo-700 transition-all group"
                >
                    <div className="bg-stone-300 dark:bg-slate-700 p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform text-stone-700 dark:text-indigo-400">
                        <Download size={20} />
                    </div>
                    <span className="text-xs font-bold text-stone-700 dark:text-slate-300">Backup exportieren</span>
                </button>

                <button 
                    onClick={handleImportClick}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-100 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-stone-400 dark:hover:border-emerald-700 transition-all group"
                >
                    <div className="bg-stone-300 dark:bg-slate-700 p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform text-stone-700 dark:text-emerald-400">
                        <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold text-stone-700 dark:text-slate-300">Backup importieren</span>
                </button>
                
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>

            <div className="mt-3 bg-stone-300 dark:bg-amber-900/20 border border-stone-400 dark:border-amber-900/30 p-2.5 rounded-lg flex gap-2">
                <AlertTriangle size={14} className="text-stone-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-stone-700 dark:text-amber-400 leading-tight">
                    <strong>Hinweis:</strong> Beim Importieren werden deine aktuell gespeicherten Preise und der Verlauf überschrieben.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Package, Truck, Info, Table2, CheckCircle2, X, Settings, Sun, Moon, PencilLine } from 'lucide-react';
import { PackageSpecs, CalculationResult, Tariff, ChangeLogEntry, CarrierId } from './types';
import { TARIFFS as DEFAULT_TARIFFS, DEFAULT_LAST_UPDATED, DATA_VERSION } from './constants';
import { calculateBestRates } from './utils/calculator';
import { PackageForm } from './components/PackageForm';
import { ResultCard } from './components/ResultCard';
import { TariffOverview } from './components/TariffOverview';
import { AboutModal } from './components/AboutModal';
import { SettingsModal } from './components/SettingsModal';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { fetchLatestTariffPrices } from './services/gemini';

const App: React.FC = () => {
  const [specs, setSpecs] = useState<PackageSpecs>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('portoiq_theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Data State
  const [tariffs, setTariffs] = useState<Tariff[]>(DEFAULT_TARIFFS);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  
  // Edit Mode Snapshot State (For "Cancel" functionality)
  const [tariffSnapshot, setTariffSnapshot] = useState<Tariff[] | null>(null);

  // UI Interaction State
  const [showTariffOverview, setShowTariffOverview] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, details?: string[], type?: 'success' | 'error'} | null>(null);

  // Update Status Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateChanges, setUpdateChanges] = useState<string[]>([]);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Pending Update State (Waiting for user confirmation)
  const [pendingTariffs, setPendingTariffs] = useState<Tariff[] | null>(null);

  // Apply Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('portoiq_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('portoiq_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Load saved data on mount
  useEffect(() => {
    // Updated keys to match brand "portoiq_"
    const savedTariffs = localStorage.getItem('portoiq_tariffs');
    const savedDate = localStorage.getItem('portoiq_last_updated');
    const savedLog = localStorage.getItem('portoiq_change_log');
    const savedVersion = localStorage.getItem('portoiq_data_version');

    // VERSION CHECK LOGIC
    let currentVersion = parseInt(savedVersion || '0', 10);

    // Migration: If user has data but no version, assume they are on v1 (current baseline)
    // This prevents wiping existing data until we actually bump to v2
    if (!savedVersion && savedTariffs) {
        currentVersion = 1;
        localStorage.setItem('portoiq_data_version', '1');
    }

    // If code version is newer than stored version, force reset to defaults
    if (currentVersion < DATA_VERSION) {
        console.log(`App updated: Migrating from v${currentVersion} to v${DATA_VERSION}`);
        
        setTariffs(DEFAULT_TARIFFS);
        setLastUpdated(DEFAULT_LAST_UPDATED);
        
        // Persist new defaults immediately
        localStorage.setItem('portoiq_tariffs', JSON.stringify(DEFAULT_TARIFFS));
        localStorage.setItem('portoiq_last_updated', DEFAULT_LAST_UPDATED);
        localStorage.setItem('portoiq_data_version', String(DATA_VERSION));

        // Notify user if it wasn't a fresh install
        if (currentVersion > 0) {
            setNotification({ message: 'Preise wurden auf den neuesten Stand aktualisiert.', type: 'success' });
        }
    } else {
        // Normal Load
        if (savedTariffs) {
            try {
                setTariffs(JSON.parse(savedTariffs));
            } catch (e) {
                console.error("Failed to load saved tariffs", e);
            }
        }
        
        if (savedLog) {
            try {
                setChangeLog(JSON.parse(savedLog));
            } catch (e) {
                console.error("Failed to load change log", e);
            }
        }

        setLastUpdated(savedDate || DEFAULT_LAST_UPDATED);
    }
  }, []);

  // Save changes to tariffs whenever they change
  useEffect(() => {
    // Skip initial empty state if it happens, but safe here as we init with DEFAULT_TARIFFS
    if (tariffs.length > 0) {
        localStorage.setItem('portoiq_tariffs', JSON.stringify(tariffs));
    }
  }, [tariffs]);

  // Recalculate
  useEffect(() => {
    if (specs.length > 0 && specs.width > 0 && specs.height > 0 && specs.weight > 0) {
      const calculated = calculateBestRates(specs, tariffs);
      setResults(calculated);
    } else {
      setResults([]);
    }
  }, [specs, tariffs]);

  // --- EDITOR SNAPSHOT LOGIC ---
  const handleStartEdit = () => {
    setTariffSnapshot(JSON.parse(JSON.stringify(tariffs))); // Deep copy
  };

  const handleCancelEdit = () => {
    if (tariffSnapshot) {
      setTariffs(tariffSnapshot);
      setNotification({ message: 'Änderungen verworfen', type: 'error' }); // Error color purely for visual distinction
    }
    setTariffSnapshot(null);
  };

  const handleSaveEdit = () => {
    // Update timestamp on manual save to indicate currentness
    const now = new Date().toLocaleDateString('de-DE');
    setLastUpdated(now);
    localStorage.setItem('portoiq_last_updated', now);

    setTariffSnapshot(null);
    setNotification({ message: 'Änderungen gespeichert', type: 'success' });
  };

  // --- TARIFF MANAGEMENT HANDLERS ---

  const handleUpdateTariff = (updatedTariff: Tariff) => {
    setTariffs(prev => prev.map(t => t.id === updatedTariff.id ? updatedTariff : t));
    // No notification on every keystroke/save in editor, too noisy
  };

  const handleDeleteTariff = (id: string) => {
    if (confirm('Tarif wirklich löschen?')) {
      setTariffs(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddTariff = (carrier: CarrierId) => {
    const newId = `${carrier.toLowerCase()}-custom-${Date.now()}`;
    const newTariff: Tariff = {
        id: newId,
        carrier: carrier,
        name: 'Neuer Tarif',
        price: 0,
        currency: '€',
        maxWeight: 5,
        features: [],
        // Default based on carrier type roughly
        maxDimensions: carrier === 'DHL' || carrier === 'DEUTSCHEPOST' ? { length: 0, width: 0, height: 0 } : undefined,
        maxCombined: carrier !== 'DHL' && carrier !== 'DEUTSCHEPOST' ? 0 : undefined
    };
    setTariffs(prev => [...prev, newTariff]);
  };

  // --- AI UPDATE HANDLER ---

  const handleStartUpdate = async () => {
    // Check key
    const hasKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    if (!hasKey) {
        setShowSettings(true);
        setNotification({
            message: "Bitte zuerst einen API Key in den Einstellungen hinterlegen.",
            type: 'error'
        });
        return;
    }

    // Reset and open update modal
    setUpdateError(null);
    setUpdateChanges([]);
    setPendingTariffs(null);
    setIsUpdating(true);
    setShowUpdateModal(true);

    // Call Service
    const result = await fetchLatestTariffPrices(tariffs);
    
    setIsUpdating(false);

    if (result) {
      const { tariffs: newTariffs, changes } = result;
      
      if (changes.length === 0) {
         setUpdateChanges([]); // Modal will show "No changes found"
      } else {
         setUpdateChanges(changes);
         setPendingTariffs(newTariffs); // Store for confirmation
      }
      
    } else {
      setUpdateError("Verbindung fehlgeschlagen oder keine Antwort von Gemini erhalten. Bitte Key prüfen.");
    }
  };

  const handleConfirmUpdate = () => {
    if (pendingTariffs && pendingTariffs.length > 0) {
        setTariffs(pendingTariffs);
        
        const now = new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        setLastUpdated(now);
        localStorage.setItem('portoiq_last_updated', now);

        // Add to log
        if (updateChanges.length > 0) {
            const newEntry: ChangeLogEntry = { date: now, changes: updateChanges };
            const newLog = [newEntry, ...changeLog].slice(0, 50);
            setChangeLog(newLog);
            localStorage.setItem('portoiq_change_log', JSON.stringify(newLog));
        }

        setNotification({ message: 'Preise erfolgreich aktualisiert', type: 'success' });
    }
    setShowUpdateModal(false);
    setPendingTariffs(null);
  };

  const handleDiscardUpdate = () => {
    setShowUpdateModal(false);
    setPendingTariffs(null);
    setUpdateChanges([]);
    setNotification({ message: 'Update verworfen', type: 'error' });
  };

  const handleReset = () => {
    setSpecs({ length: 0, width: 0, height: 0, weight: 0 });
    setResults([]);
  };

  // Auto-dismiss main notification
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  // Determine Input State
  const hasAnyInput = specs.length > 0 || specs.width > 0 || specs.height > 0 || specs.weight > 0;
  const isComplete = specs.length > 0 && specs.width > 0 && specs.height > 0 && specs.weight > 0;

  return (
    <div className="min-h-screen pb-12 bg-stone-300 dark:bg-slate-950 transition-colors duration-300">
      {/* Header - Compact & Gray */}
      <header className="bg-stone-200 dark:bg-slate-900 border-b border-stone-300 dark:border-slate-800 sticky top-0 z-50 shadow-sm h-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between gap-4">
          
          {/* Brand & Version */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-indigo-600 dark:bg-indigo-600 text-white p-2 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none">
              <Truck size={20} className="transform -scale-x-100" />
            </div>
            <div className="flex items-baseline gap-2">
                <h1 className="font-black text-xl text-stone-900 dark:text-white tracking-tight">
                Porto<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
                </h1>
                <span className="text-[10px] font-bold text-stone-500 dark:text-slate-500 bg-stone-300 dark:bg-slate-800 px-1.5 py-0.5 rounded-md hidden sm:inline-block">v1.0.0</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
             
             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-yellow-300 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button
               onClick={() => setShowTariffOverview(true)}
               className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-800 dark:text-slate-200 bg-stone-100 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg transition-all"
               title="Preistabelle & Updates"
             >
               <Table2 size={16} className="text-stone-600 dark:text-slate-400" />
               <span className="hidden lg:inline">Tarife & Bearbeiten</span>
             </button>

             {/* Settings Button - FIXED COLOR */}
             <button
               onClick={() => setShowSettings(true)}
               className="flex items-center justify-center w-9 h-9 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors"
               title="Einstellungen"
             >
               <Settings size={20} />
             </button>

             {/* Info Button - FIXED COLOR */}
             <button
               onClick={() => setShowAbout(true)}
               className="flex items-center justify-center w-9 h-9 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors"
               title="Über PortoIQ"
             >
               <Info size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6">
        
        {/* Input Form */}
        <div className="mb-6">
          <PackageForm values={specs} onChange={setSpecs} onReset={handleReset} />
        </div>

        {/* Results Area */}
        <div className="space-y-4">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="font-bold text-stone-700 dark:text-slate-200 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {results.length} Tarife gefunden
                </h3>
              </div>
              <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {results.map((result, index) => (
                  <ResultCard key={result.tariff.id} result={result} rank={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-stone-400 dark:border-slate-800 rounded-2xl bg-stone-200/50 dark:bg-slate-900/50">
              
              {/* Three States: 1. Complete but no match. 2. Partial Input. 3. Empty */}
              
              {isComplete ? (
                 // STATE 1: Complete input, but really no results found
                 <div className="max-w-md mx-auto px-6">
                    <p className="text-stone-600 dark:text-slate-400 font-bold mb-1 text-lg">Keine Standard-Tarife gefunden.</p>
                    <p className="text-sm text-stone-500 dark:text-slate-500">
                        Das Paket ist wahrscheinlich zu groß für den Standardversand (Gurtmaß &gt; 300cm) oder zu schwer (&gt; 31.5kg).
                    </p>
                 </div>
              ) : hasAnyInput ? (
                // STATE 2: Partial Input (The "Zwischenschritt")
                <div className="max-w-md mx-auto px-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-400 dark:bg-indigo-900/20 mb-4 text-white dark:text-indigo-400">
                    <PencilLine size={28} />
                  </div>
                  <p className="text-stone-600 dark:text-slate-400 font-medium text-lg">Bitte Maße & Gewicht vervollständigen...</p>
                </div>
              ) : (
                // STATE 3: Empty (Initial)
                <div className="max-w-md mx-auto px-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-400/30 dark:bg-slate-800 mb-4 text-stone-500 dark:text-slate-600">
                    <Package size={28} />
                  </div>
                  <p className="text-stone-500 dark:text-slate-500 font-medium text-lg">Maße eingeben für Vergleich.</p>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
      
      {/* Main Toast Notification */}
      {notification && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`
                p-4 rounded-xl shadow-2xl border flex flex-col gap-2
                ${notification.type === 'error' ? 'bg-stone-800 border-stone-600 text-white' : 'bg-stone-800 border-stone-600 text-white dark:bg-slate-800 dark:border-slate-600'}
              `}>
                  <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                          <CheckCircle2 className={`${notification.type === 'error' ? 'text-stone-400' : 'text-stone-300'} h-5 w-5`} />
                          <p className="font-semibold text-base">{notification.message}</p>
                      </div>
                      <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-white transition-colors">
                          <X size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Overview Modal */}
      <TariffOverview 
        isOpen={showTariffOverview} 
        onClose={() => setShowTariffOverview(false)} 
        tariffs={tariffs} 
        lastUpdated={lastUpdated}
        onUpdate={handleStartUpdate}
        onChangeLogRequest={() => {}} // Internal handling moved
        changeLog={changeLog}
        // CRUD Props
        onUpdateTariff={handleUpdateTariff}
        onDeleteTariff={handleDeleteTariff}
        onAddTariff={handleAddTariff}
        // Snapshot/Editor Logic
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
      />

      {/* Update Status / Confirmation Modal */}
      <UpdateStatusModal 
        isOpen={showUpdateModal}
        isLoading={isUpdating}
        resultChanges={updateChanges}
        error={updateError}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleConfirmUpdate}
        onDiscard={handleDiscardUpdate}
      />

      {/* About Modal */}
      <AboutModal 
        isOpen={showAbout} 
        onClose={() => setShowAbout(false)} 
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        currentTariffs={tariffs}
        lastUpdated={lastUpdated}
        changeLog={changeLog}
      />
    </div>
  );
};

export default App;
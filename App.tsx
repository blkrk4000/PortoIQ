import React, { useState, useEffect } from 'react';
import { Package, Truck, Info, Table2, Sun, Moon, PencilLine } from 'lucide-react';
import { PackageSpecs, CalculationResult } from './types';
import { TARIFFS, DEFAULT_LAST_UPDATED } from './constants';
import { calculateBestRates } from './utils/calculator';
import { PackageForm } from './components/PackageForm';
import { ResultCard } from './components/ResultCard';
import { TariffOverview } from './components/TariffOverview';
import { AboutModal } from './components/AboutModal';

// Tarife kommen ausschließlich aus constants.ts (Update per Push auf GitHub)
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
  const [results, setResults] = useState<CalculationResult[]>([]);

  // UI Interaction State
  const [showTariffOverview, setShowTariffOverview] = useState(false);
  const [showAbout, setShowAbout] = useState(false);


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

  // Recalculate
  useEffect(() => {
    if (specs.length > 0 && specs.width > 0 && specs.height > 0 && specs.weight > 0) {
      const calculated = calculateBestRates(specs, TARIFFS);
      setResults(calculated);
    } else {
      setResults([]);
    }
  }, [specs]);

  const handleReset = () => {
    setSpecs({ length: 0, width: 0, height: 0, weight: 0 });
    setResults([]);
  };

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
            <div className="flex items-center gap-3">
                <h1 className="font-black text-2xl text-stone-900 dark:text-white tracking-tight">
                Porto<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
                </h1>
                <span className="text-[10px] font-bold text-stone-500 dark:text-slate-500 bg-stone-300 dark:bg-slate-800 px-2 py-1 rounded-md hidden sm:inline-block">v1.0.0</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
             
             {/* Primary Action */}
             <button
               onClick={() => setShowTariffOverview(true)}
               className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-800 dark:text-slate-200 bg-stone-100 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg transition-all mr-1"
               title="Preistabelle & Updates"
             >
               <Table2 size={18} className="text-stone-600 dark:text-slate-400" />
               <span className="hidden lg:inline">Tarife</span>
             </button>

             {/* Divider */}
             <div className="h-6 w-px bg-stone-300 dark:bg-slate-700 mx-1 hidden sm:block"></div>

             {/* Secondary Actions Group */}
             <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-9 h-9 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-yellow-300 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors"
                    title={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Info Button */}
                <button
                onClick={() => setShowAbout(true)}
                className="flex items-center justify-center w-9 h-9 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Über PortoIQ"
                >
                <Info size={20} />
                </button>
             </div>
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

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-6 pb-6 text-center">
        <p className="text-xs font-medium text-stone-400 dark:text-slate-600">
            Preisstand: {DEFAULT_LAST_UPDATED}
        </p>
      </footer>
      
      {/* Overview Modal */}
      <TariffOverview 
        isOpen={showTariffOverview} 
        onClose={() => setShowTariffOverview(false)} 
        tariffs={TARIFFS} 
        lastUpdated={DEFAULT_LAST_UPDATED}
      />

      {/* About Modal */}
      <AboutModal 
        isOpen={showAbout} 
        onClose={() => setShowAbout(false)} 
      />

    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { X, Cpu, Database, CloudCog, Bot, Scale, ChevronDown, ChevronUp, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [showLicense, setShowLicense] = useState(false);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-stone-200 dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-300 dark:border-slate-800 bg-stone-200/50 dark:bg-slate-850/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-stone-800 dark:text-white">Über PortoIQ</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-stone-300 dark:hover:bg-slate-700 rounded-full transition-colors text-stone-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Creators */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest">Projekt</h3>
            <div className="flex items-center gap-4 bg-stone-100 dark:bg-slate-800 p-3 rounded-lg border border-stone-300 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="bg-stone-300 dark:bg-indigo-900/30 p-1.5 rounded-full text-stone-600 dark:text-indigo-400">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-semibold text-stone-700 dark:text-slate-200">Personal Tool</span>
                </div>
                <span className="text-stone-400 dark:text-slate-600 text-sm">+</span>
                <div className="flex items-center gap-2">
                    <div className="bg-stone-300 dark:bg-blue-900/30 p-1.5 rounded-full text-stone-600 dark:text-blue-400">
                        <Bot size={16} />
                    </div>
                    <span className="text-sm font-semibold text-stone-700 dark:text-slate-200">Gemini AI</span>
                </div>
            </div>
          </div>

          {/* Tech Specs */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest">Technische Funktionsweise</h3>
             <div className="space-y-4 text-sm text-stone-600 dark:text-slate-300">
                
                <div className="flex gap-3">
                    <div className="mt-0.5 min-w-8">
                        <Database className="text-stone-400 dark:text-slate-500" size={18} />
                    </div>
                    <div>
                        <strong className="text-stone-800 dark:text-white block mb-0.5">Lokale Tarif-Datenbank</strong>
                        <p className="leading-relaxed">
                            Die App speichert eine Basis-Datenbank der gängigen Tarife direkt im Browser (Local Storage).
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="mt-0.5 min-w-8">
                        <Cpu className="text-stone-400 dark:text-slate-500" size={18} />
                    </div>
                    <div>
                        <strong className="text-stone-800 dark:text-white block mb-0.5">Algorithmus</strong>
                        <p className="leading-relaxed">
                            Bei Eingabe der Maße prüft ein lokaler Algorithmus Dimensionen und Gewicht gegen die Limits der Anbieter.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="mt-0.5 min-w-8">
                        <CloudCog className="text-stone-500 dark:text-indigo-400" size={18} />
                    </div>
                    <div>
                        <strong className="text-stone-700 dark:text-indigo-400 block mb-0.5">AI Live-Update (Gemini)</strong>
                        <p className="leading-relaxed">
                            Der "Aktualisieren"-Button nutzt das <strong>Google Gemini 2.0 Flash</strong> Modell, um Preise live im Internet zu validieren (Google Search Grounding).
                        </p>
                    </div>
                </div>

             </div>
          </div>

          {/* License */}
          <div className="space-y-3 pt-2 border-t border-stone-300 dark:border-slate-800">
             <h3 className="text-xs font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} /> Rechtliches
             </h3>
             <div className="bg-stone-100 dark:bg-slate-800 p-3 rounded-lg border border-stone-300 dark:border-slate-700 text-[11px] text-stone-500 dark:text-slate-400 leading-relaxed">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold font-mono">MIT License</p>
                    <button 
                        onClick={() => setShowLicense(!showLicense)}
                        className="flex items-center gap-1 text-stone-600 dark:text-indigo-400 hover:text-stone-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                    >
                        {showLicense ? (
                            <>Weniger anzeigen <ChevronUp size={12}/></>
                        ) : (
                            <>Lizenztext anzeigen <ChevronDown size={12}/></>
                        )}
                    </button>
                </div>
                
                <p>Copyright (c) {currentYear} Personal Project</p>
                
                {!showLicense ? (
                    <p className="mt-1 opacity-75">
                      Permission is hereby granted, free of charge, to any person obtaining a copy of this software... (Klicke oben für den vollständigen Text)
                    </p>
                ) : (
                    <div className="mt-3 p-2 bg-stone-200 dark:bg-slate-900 rounded border border-stone-300 dark:border-slate-700 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-normal text-stone-600 dark:text-slate-400">
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
                    </div>
                )}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-200 dark:bg-slate-850 px-5 py-3 border-t border-stone-300 dark:border-slate-800 text-center flex-shrink-0">
            <p className="text-[10px] text-stone-500 dark:text-slate-500">PortoIQ Version 1.0.0 • Private Use</p>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Tariff, ChangeLogEntry, CarrierId } from '../types';
import { CARRIERS } from '../constants';
import { X, Shield, ShieldOff, CalendarClock, RefreshCw, ChevronDown, ChevronRight, History, Edit, Trash2, Plus, Save, XCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tariffs: Tariff[];
  lastUpdated: string | null;
  onUpdate: () => void;
  changeLog: ChangeLogEntry[];
  onChangeLogRequest: () => void; // Deprecated but kept for compatibility interface if needed
  
  // CRUD Actions
  onUpdateTariff: (t: Tariff) => void;
  onDeleteTariff: (id: string) => void;
  onAddTariff: (carrier: CarrierId) => void;
  
  // Editor Snapshot Logic
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export const TariffOverview: React.FC<Props> = ({ 
    isOpen, onClose, tariffs, lastUpdated, onUpdate, changeLog, 
    onUpdateTariff, onDeleteTariff, onAddTariff,
    onStartEdit, onCancelEdit, onSaveEdit
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  if (!isOpen) return null;

  const handleToggleEdit = () => {
    if (!isEditMode) {
        onStartEdit();
        setIsEditMode(true);
    } else {
        // This button acts as "Save" now
        onSaveEdit();
        setIsEditMode(false);
    }
  };

  const handleCancel = () => {
      onCancelEdit();
      setIsEditMode(false);
  };

  const handleSafeClose = () => {
    if (isEditMode) {
        // Prompt user to prevent accidental closure which would implicitly commit changes (by losing the undo snapshot on next open)
        if (window.confirm("Du befindest dich noch im Bearbeitungsmodus.\n\nMöchtest du die Änderungen SPEICHERN und das Fenster schließen?\n(Klicke 'Abbrechen' um im Fenster zu bleiben)")) {
            onSaveEdit();
            setIsEditMode(false);
            onClose();
        }
        // If they want to discard, they should click Cancel here, then click "Abbrechen" in the UI.
    } else {
        onClose();
    }
  };

  // Group tariffs by carrier
  const groupedTariffs = tariffs.reduce((acc, tariff) => {
    if (!acc[tariff.carrier]) {
      acc[tariff.carrier] = [];
    }
    acc[tariff.carrier].push(tariff);
    return acc;
  }, {} as Record<string, Tariff[]>);

  // Helper to check for liability
  const hasLiability = (t: Tariff) => t.features.some(f => 
    f.includes('Haftung') && !f.toLowerCase().includes('keine')
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity" 
        onClick={handleSafeClose} 
      />
      
      <div className="relative bg-stone-200 dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-stone-300 dark:border-slate-800 bg-stone-200 dark:bg-slate-900 sticky top-0 z-20 gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                Portopreise
                {isEditMode && <span className="text-xs bg-stone-400 text-white px-2 py-0.5 rounded border border-stone-500">Editor</span>}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <CalendarClock size={14} className="text-stone-500 dark:text-slate-400"/>
                <p className="text-sm font-medium text-stone-600 dark:text-slate-400">
                    Stand: <span className="text-stone-800 dark:text-slate-200 font-semibold">{lastUpdated || 'Standard-Daten'}</span>
                </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {/* Edit Toggle (Save/Start) */}
             <button
                onClick={handleToggleEdit}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-lg transition-all border
                    ${isEditMode 
                        ? 'bg-stone-300 dark:bg-emerald-900/20 text-stone-800 dark:text-emerald-600 border-stone-400 dark:border-emerald-800 hover:bg-stone-400' 
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-stone-300 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700'}
                `}
             >
                {isEditMode ? <Save size={14} /> : <Edit size={14} />}
                <span>{isEditMode ? 'Speichern' : 'Bearbeiten'}</span>
             </button>

            {/* Cancel Button (Only in Edit Mode) */}
            {isEditMode && (
                 <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-stone-600 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-transparent rounded-lg transition-all"
                >
                    <XCircle size={14} />
                    <span>Abbrechen</span>
                </button>
            )}

            {!isEditMode && (
                <button 
                    onClick={onUpdate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-stone-200 bg-stone-800 dark:bg-indigo-500 hover:bg-black dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-all"
                >
                    <RefreshCw size={14} />
                    <span>KI Update</span>
                </button>
            )}

            <button 
                onClick={handleSafeClose}
                className="p-2 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors text-stone-600 dark:text-slate-400 ml-2"
                title="Schließen"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 bg-stone-300 dark:bg-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.keys(CARRIERS).map((carrierKey) => {
              const carrierId = carrierKey as CarrierId;
              const config = CARRIERS[carrierId];
              const carrierTariffs = groupedTariffs[carrierKey] || [];
              
              // Sort by price
              const sortedTariffs = carrierTariffs.sort((a,b) => a.price - b.price);

              return (
                <div key={carrierKey} className="bg-stone-200 dark:bg-slate-850 rounded-xl border border-stone-400 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Carrier Header - FULL COLOR, NO GRAYSCALE */}
                  <div className={`${config.color} p-4 text-center border-b border-white/10 flex justify-between items-center relative`}>
                     <div className="w-8"></div> {/* Spacer to center title */}
                     <span className={`${config.textColor} font-black text-xl italic tracking-tight`}>{config.logoText}</span>
                     <div className="w-8 flex justify-end">
                        {isEditMode && (
                             <button 
                                onClick={() => onAddTariff(carrierId)}
                                className="bg-white/20 hover:bg-white/40 text-white rounded p-1 transition-colors"
                                title="Tarif hinzufügen"
                             >
                                 <Plus size={16} />
                             </button>
                        )}
                     </div>
                  </div>
                  
                  {/* List */}
                  <div className="divide-y divide-stone-300 dark:divide-slate-800 flex-1">
                    {sortedTariffs.map((tariff) => (
                      <div key={tariff.id} className="p-4 hover:bg-stone-300 dark:hover:bg-slate-800 transition-colors relative group">
                        
                        {!isEditMode ? (
                            // --- VIEW MODE ---
                            <>
                                <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm leading-tight pr-2">{tariff.name}</span>
                                <span className="font-bold text-stone-900 dark:text-white bg-stone-300 dark:bg-slate-800 px-2 py-0.5 rounded text-sm whitespace-nowrap">
                                    {tariff.price.toFixed(2)} €
                                </span>
                                </div>
                                
                                <div className="text-xs text-stone-600 dark:text-slate-400 space-y-1.5">
                                {/* Dimensions */}
                                <div className="flex flex-wrap gap-x-2 gap-y-1 opacity-90">
                                    {tariff.maxDimensions && (
                                        <span className="bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 px-1 rounded">Max: {tariff.maxDimensions.length}x{tariff.maxDimensions.width}x{tariff.maxDimensions.height}</span>
                                    )}
                                    {tariff.maxCombined && (
                                        <span className="bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 px-1 rounded">L+K ≤ {tariff.maxCombined} cm</span>
                                    )}
                                    <span className="font-medium text-stone-700 dark:text-slate-300">{tariff.maxWeight} kg</span>
                                </div>

                                {/* Features */}
                                <div className="flex items-center gap-1.5 pt-1">
                                    {hasLiability(tariff) ? (
                                        <span className="text-stone-600 dark:text-emerald-400 flex items-center gap-1 bg-stone-300 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-sm" title="Versichert">
                                            <Shield size={10} /> <span className="text-[10px] font-semibold">Versichert</span>
                                        </span>
                                    ) : (
                                        <span className="text-stone-400 dark:text-slate-500 flex items-center gap-1 bg-stone-300 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm" title="Unversichert">
                                            <ShieldOff size={10} /> <span className="text-[10px]">Unversichert</span>
                                        </span>
                                    )}
                                </div>
                                </div>
                            </>
                        ) : (
                            // --- EDIT MODE ---
                            <TariffEditor 
                                tariff={tariff} 
                                onSave={onUpdateTariff} 
                                onDelete={onDeleteTariff} 
                            />
                        )}
                      </div>
                    ))}

                    {/* Empty State for Carrier */}
                    {sortedTariffs.length === 0 && (
                        <div className="p-8 text-center text-stone-500 text-xs italic">
                            Keine Tarife.
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* History Section */}
          <div className="border-t border-stone-300 dark:border-slate-800 pt-6">
             <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-bold text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 transition-colors mb-4"
             >
                {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <History size={16} />
                Verlauf der automatischen Änderungen
             </button>
             
             {showHistory && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                     {changeLog.length === 0 ? (
                         <p className="text-sm text-stone-500 dark:text-slate-600 italic pl-6">Noch keine Änderungen protokolliert.</p>
                     ) : (
                         changeLog.map((log, index) => (
                             <div key={index} className="bg-stone-200 dark:bg-slate-850 border border-stone-400 dark:border-slate-800 rounded-lg p-4">
                                 <div className="flex items-center gap-2 mb-2">
                                     <span className="text-xs font-bold text-stone-200 dark:text-white bg-stone-600 dark:bg-slate-600 px-2 py-0.5 rounded-full">
                                         {log.date}
                                     </span>
                                 </div>
                                 <ul className="space-y-1 pl-1">
                                     {log.changes.map((change, i) => (
                                         <li key={i} className="text-sm text-stone-700 dark:text-slate-300 border-l-2 border-stone-400 dark:border-indigo-800 pl-3 py-0.5">
                                             {change}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         ))
                     )}
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT FOR EDITING ---

const TariffEditor: React.FC<{
    tariff: Tariff, 
    onSave: (t: Tariff) => void, 
    onDelete: (id: string) => void
}> = ({ tariff, onSave, onDelete }) => {
    // Local state for inputs
    const [name, setName] = useState(tariff.name);
    const [price, setPrice] = useState(tariff.price.toString());
    const [weight, setWeight] = useState(tariff.maxWeight.toString());
    
    // Optional Dims
    const [dims, setDims] = useState({
        l: tariff.maxDimensions?.length.toString() || '',
        w: tariff.maxDimensions?.width.toString() || '',
        h: tariff.maxDimensions?.height.toString() || ''
    });
    const [combined, setCombined] = useState(tariff.maxCombined?.toString() || '');

    const handleSave = () => {
        const p = parseFloat(price.replace(',', '.'));
        const w = parseFloat(weight.replace(',', '.'));
        const l = parseFloat(dims.l);
        const wi = parseFloat(dims.w);
        const h = parseFloat(dims.h);
        const comb = parseFloat(combined);

        if (isNaN(p) || isNaN(w)) return; // Basic validation

        const updated: Tariff = {
            ...tariff,
            name,
            price: p,
            maxWeight: w,
            // Reconstruct logic based on inputs
            maxDimensions: (l && wi && h) ? { length: l, width: wi, height: h } : undefined,
            maxCombined: comb ? comb : undefined
        };
        onSave(updated);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input 
                    className="flex-1 bg-stone-100 dark:bg-slate-700 border-none rounded px-2 py-1 text-xs font-bold"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Name"
                />
                <input 
                    className="w-16 bg-stone-100 dark:bg-slate-700 border-none rounded px-2 py-1 text-xs text-right font-mono"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="€"
                    type="number"
                    step="0.01"
                />
            </div>

            {/* Tech Specs Edit */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400 w-4">Kg</span>
                    <input 
                        className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded px-1 py-0.5 text-[10px]"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        type="number"
                    />
                </div>
                {/* Toggle between L+S or LxWxH based on carrier type usually, but lets show both optionally if existing */}
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400 w-4">{tariff.maxCombined !== undefined ? 'L+K' : 'LWH'}</span>
                    {tariff.maxCombined !== undefined ? (
                        <input 
                             className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded px-1 py-0.5 text-[10px]"
                             value={combined}
                             onChange={e => setCombined(e.target.value)}
                             placeholder="cm"
                             type="number"
                        />
                    ) : (
                         <div className="flex gap-0.5">
                             <input className="w-8 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded px-0.5 py-0.5 text-[10px] text-center" value={dims.l} onChange={e => setDims({...dims, l: e.target.value})} placeholder="L"/>
                             <input className="w-8 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded px-0.5 py-0.5 text-[10px] text-center" value={dims.w} onChange={e => setDims({...dims, w: e.target.value})} placeholder="B"/>
                             <input className="w-8 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded px-0.5 py-0.5 text-[10px] text-center" value={dims.h} onChange={e => setDims({...dims, h: e.target.value})} placeholder="H"/>
                         </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-1">
                 <button onClick={() => onDelete(tariff.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1 rounded transition-colors" title="Löschen">
                    <Trash2 size={14} />
                 </button>
                 <button onClick={handleSave} className="text-stone-800 dark:text-emerald-400 hover:bg-stone-300 dark:hover:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors">
                    <Save size={12} /> Speichern
                 </button>
            </div>
        </div>
    );
}
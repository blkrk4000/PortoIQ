import React, { useState, useEffect } from 'react';
import { PackageSpecs } from '../types';
import { RotateCcw, Calculator, Weight, Ruler, PackageOpen, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  values: PackageSpecs;
  onChange: (specs: PackageSpecs) => void;
  onReset: () => void;
}

const StandardInput = ({ 
  label, 
  icon: Icon,
  value, 
  onChange, 
  placeholder,
  suffix
}: { 
  label: string; 
  icon: React.ElementType;
  value: number; 
  onChange: (val: number) => void; 
  placeholder: string;
  suffix: string;
}) => {
  const [localVal, setLocalVal] = useState(value === 0 ? '' : value.toString());

  useEffect(() => {
    if (value === 0 && localVal !== '0' && localVal !== '0.' && localVal !== '') {
        setLocalVal('');
    } else if (value !== 0 && parseFloat(localVal) !== value) {
        setLocalVal(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') {
      setLocalVal('');
      onChange(0);
      return;
    }
    setLocalVal(input);
    const num = parseFloat(input);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  // Custom Spin Logic
  const handleStep = (amount: number) => {
    const current = parseFloat(localVal) || 0;
    // Fix floating point math issues (e.g. 0.1 + 0.2)
    const next = Math.max(0, parseFloat((current + amount).toFixed(1)));
    setLocalVal(next.toString());
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={14} className="text-stone-400 dark:text-indigo-500/70" /> {label}
      </label>
      <div className="relative group">
        <input
            type="number"
            min="0"
            step="0.1"
            placeholder={placeholder}
            value={localVal}
            onChange={handleChange}
            onBlur={() => {
                if (localVal === '' || isNaN(parseFloat(localVal))) {
                    setLocalVal(value === 0 ? '' : value.toString());
                }
            }}
            // Added pr-14 to make room for suffix AND buttons
            className="w-full h-11 pl-3 pr-14 rounded-lg bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 focus:border-stone-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-stone-400/20 dark:focus:ring-indigo-500/10 text-stone-900 dark:text-white font-semibold outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-slate-600 shadow-sm"
        />
        
        {/* Container for Suffix and Buttons */}
        <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1 bg-stone-100 dark:bg-slate-800 rounded-r-md px-1">
            {/* Suffix */}
            <span className="pointer-events-none text-stone-400 dark:text-slate-500 text-xs font-bold mr-1">
                {suffix}
            </span>

            {/* Custom Spin Buttons - Hidden by default, show on hover or focus-within */}
            <div className="flex flex-col justify-center h-full gap-[1px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                <button 
                    type="button"
                    tabIndex={-1} // Prevent tab focus
                    onClick={() => handleStep(1)}
                    className="flex items-center justify-center h-4 w-5 rounded-t-sm hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors active:scale-95"
                    title="Erhöhen (+1)"
                >
                    <ChevronUp size={12} strokeWidth={3} />
                </button>
                <button 
                    type="button"
                    tabIndex={-1} // Prevent tab focus
                    onClick={() => handleStep(-1)}
                    className="flex items-center justify-center h-4 w-5 rounded-b-sm hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors active:scale-95"
                    title="Verringern (-1)"
                >
                    <ChevronDown size={12} strokeWidth={3} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export const PackageForm: React.FC<Props> = ({ values, onChange, onReset }) => {
  const updateField = (field: keyof PackageSpecs, val: number) => {
    onChange({ ...values, [field]: val });
  };

  const hasValues = values.length > 0 || values.width > 0 || values.height > 0 || values.weight > 0;
  const hasDimensions = values.length > 0 && values.width > 0 && values.height > 0;

  // Live Calculation Logic
  let combined = 0; // Längste + Kürzeste Seite

  if (hasDimensions) {
    const dims = [values.length, values.width, values.height].sort((a, b) => b - a);
    const longest = dims[0];
    const shortest = dims[2];
    combined = longest + shortest;
  }

  return (
    <div className="bg-stone-200 dark:bg-slate-900 rounded-2xl shadow-sm border border-stone-300 dark:border-slate-800 p-6 transition-all duration-300">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-white flex items-center gap-2.5">
          <div className="bg-stone-300 dark:bg-indigo-900/30 p-2 rounded-lg text-stone-600 dark:text-indigo-400">
             <PackageOpen className="w-5 h-5" />
          </div>
          Paketdaten erfassen
        </h3>
        
        {hasValues && (
          <button 
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-800 dark:text-rose-400 bg-rose-200 hover:bg-rose-300 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 px-4 py-2 rounded-lg transition-all"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>
      
      {/* Inputs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
        <StandardInput 
            label="Länge" 
            icon={Ruler}
            value={values.length} 
            onChange={(v) => updateField('length', v)} 
            placeholder="0"
            suffix="cm"
        />
        <StandardInput 
            label="Breite" 
            icon={Ruler}
            value={values.width} 
            onChange={(v) => updateField('width', v)} 
            placeholder="0"
            suffix="cm"
        />
        <StandardInput 
            label="Höhe" 
            icon={Ruler}
            value={values.height} 
            onChange={(v) => updateField('height', v)} 
            placeholder="0"
            suffix="cm"
        />
        <StandardInput 
            label="Gewicht" 
            icon={Weight}
            value={values.weight} 
            onChange={(v) => updateField('weight', v)} 
            placeholder="0"
            suffix="kg"
        />
      </div>

      {/* Live Calculated Stats Footer - Compact */}
      {hasDimensions && (
        <div className="pt-2 mt-2 border-t border-stone-300 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-300 dark:bg-slate-800 text-stone-500 dark:text-slate-600">
                    <Calculator size={12} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-stone-500 dark:text-slate-500 uppercase tracking-wide">
                        L+K (Kombimaß):
                    </span>
                    <span className="text-sm font-bold text-stone-700 dark:text-slate-200 font-mono">
                        {combined.toFixed(1)} cm
                    </span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};